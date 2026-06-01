"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Sparkles,
  Download,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileVideo,
} from "lucide-react";
import dynamic from "next/dynamic";

import { VideoUpload } from "@/components/VideoUpload";
import { TranscriptionView } from "@/components/TranscriptionView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TranscriptionResult, TranscriptionSegment, TranscriptionWord } from "@/lib/whisper";

const VideoPreview = dynamic(
  () => import("@/components/VideoPreview").then((m) => m.VideoPreview),
  { ssr: false, loading: () => <div className="aspect-video w-full rounded-xl bg-white/4 animate-pulse" /> }
);

type Step = "idle" | "transcribing" | "review" | "rendering" | "done" | "error";

function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const vid = document.createElement("video");
    vid.preload = "metadata";
    vid.onloadedmetadata = () => {
      const w = vid.videoWidth || 1080;
      const h = vid.videoHeight || 1920;
      URL.revokeObjectURL(url);
      resolve({ width: w, height: h });
    };
    vid.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 1080, height: 1920 });
    };
    vid.src = url;
  });
}

export default function Home() {
  const [step, setStep] = useState<Step>("idle");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 1080, height: 1920 });
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [words, setWords] = useState<TranscriptionWord[]>([]);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [removeSilencesEnabled, setRemoveSilencesEnabled] = useState(true);
  const [transcribeMsg, setTranscribeMsg] = useState("Transcrevendo com Whisper...");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setVideoFile(file);
    setStep("transcribing");
    setErrorMsg(null);
    getVideoDimensions(file).then(setVideoDimensions);

    let phaseTimer: ReturnType<typeof setTimeout> | null = null;
    if (removeSilencesEnabled) {
      setTranscribeMsg("Removendo silêncios...");
      phaseTimer = setTimeout(() => setTranscribeMsg("Transcrevendo áudio..."), 8000);
    } else {
      setTranscribeMsg("Transcrevendo com Whisper...");
    }

    try {
      const fd = new FormData();
      fd.append("video", file);
      fd.append("removeSilences", removeSilencesEnabled ? "true" : "false");

      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Erro na transcrição.");

      setTranscription(data);
      setSegments(data.segments ?? []);
      setWords(data.words ?? []);
      setStep("review");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido.");
      setStep("error");
    } finally {
      if (phaseTimer) clearTimeout(phaseTimer);
    }
  }, [removeSilencesEnabled]);

  const handleSegmentsChange = useCallback(
    (updatedSegments: TranscriptionSegment[]) => {
      setSegments(updatedSegments);

      const changedIndex = updatedSegments.findIndex(
        (seg, i) => seg.text !== segments[i]?.text
      );
      if (changedIndex === -1) return;

      const changedSeg = updatedSegments[changedIndex];
      const tokens = changedSeg.text.trim().split(/\s+/).filter(Boolean);

      const outsideWords = words.filter(
        (w) => w.end <= changedSeg.start || w.start >= changedSeg.end
      );

      if (tokens.length === 0) {
        setWords(outsideWords);
        return;
      }

      const timePerToken = (changedSeg.end - changedSeg.start) / tokens.length;
      const newWords: TranscriptionWord[] = tokens.map((word, i) => ({
        word,
        start: changedSeg.start + i * timePerToken,
        end: changedSeg.start + (i + 1) * timePerToken,
      }));

      setWords([...outsideWords, ...newWords].sort((a, b) => a.start - b.start));
    },
    [segments, words]
  );

  const handleRender = useCallback(async () => {
    if (!videoFile || !transcription) return;
    setStep("rendering");
    setRenderProgress(0);

    try {
      const fd = new FormData();
      fd.append("video", videoFile);
      fd.append("words", JSON.stringify(words));
      fd.append("duration", String(transcription.duration));
      fd.append("width", String(videoDimensions.width));
      fd.append("height", String(videoDimensions.height));

      const res = await fetch("/api/render", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao iniciar render.");
      }
      const { jobId } = await res.json();

      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/render/status?jobId=${jobId}`);
          const { status, error } = await statusRes.json();

          if (status === "processing") {
            setRenderProgress((p) => Math.min(p + 3, 90));
            return;
          }

          clearInterval(pollingRef.current!);
          pollingRef.current = null;

          if (status === "error") {
            setErrorMsg(error ?? "Erro ao renderizar.");
            setStep("error");
            return;
          }

          // status === "done"
          setRenderProgress(100);

          const dlRes = await fetch(`/api/render/download?jobId=${jobId}`);
          if (!dlRes.ok) throw new Error("Erro ao baixar o vídeo.");

          const blob = await dlRes.blob();
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = "video-legendado.mp4";
          a.click();

          setDownloadUrl(url);
          setStep("done");
        } catch (pollErr) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setErrorMsg(pollErr instanceof Error ? pollErr.message : "Erro desconhecido.");
          setStep("error");
        }
      }, 2000);

    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido.");
      setStep("error");
    }
  }, [videoFile, transcription, words, videoDimensions]);

  const reset = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setStep("idle");
    setVideoFile(null);
    setVideoDimensions({ width: 1080, height: 1920 });
    setTranscription(null);
    setSegments([]);
    setWords([]);
    setRenderProgress(0);
    setDownloadUrl(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/6 bg-[#050508]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#00c4f0] flex items-center justify-center">
              <FileVideo className="h-3.5 w-3.5 text-black" />
            </div>
            <span className="font-semibold text-sm tracking-tight">VideoEditor IA</span>
            <Badge variant="secondary" className="text-[10px]">Beta</Badge>
          </div>

          {step !== "idle" && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Novo vídeo
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        {/* Hero */}
        {step === "idle" && (
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00c4f0]/10 border border-[#00c4f0]/20 text-[#00c4f0] text-xs font-medium mb-6">
              <Sparkles className="h-3 w-3" />
              Powered by OpenAI Whisper + FFmpeg
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
              Editor de Vídeo com IA
            </h1>
            <p className="text-white/50 max-w-md mx-auto">
              Faça upload de um vídeo, transcreva automaticamente com Whisper e exporte com legendas animadas sincronizadas.
            </p>
          </div>
        )}

        <div className="grid gap-6">
          {/* Upload Card */}
          {(step === "idle" || step === "error") && (
            <Card>
              <CardHeader>
                <CardTitle>Upload de Vídeo</CardTitle>
                <CardDescription>Arraste ou selecione um arquivo MP4, MOV ou AVI</CardDescription>
              </CardHeader>
              <CardContent>
                <VideoUpload onUpload={handleUpload} />
                <label className="flex items-center gap-2.5 mt-4 cursor-pointer select-none w-fit">
                  <input
                    type="checkbox"
                    checked={removeSilencesEnabled}
                    onChange={(e) => setRemoveSilencesEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#00c4f0] rounded"
                  />
                  <span className="text-sm text-white/50">Remover silêncios automaticamente</span>
                </label>
                {step === "error" && errorMsg && (
                  <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Ocorreu um erro</p>
                      <p className="text-xs text-red-400/70 mt-0.5">{errorMsg}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transcribing */}
          {step === "transcribing" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-[#00c4f0]/10 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-[#00c4f0] animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-[#00c4f0]/20 animate-ping" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white">{transcribeMsg}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {videoFile?.name} • Isso pode levar alguns segundos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review step */}
          {step === "review" && transcription && videoFile && (
            <>
              {/* Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Prévia com Legendas</CardTitle>
                      <CardDescription>Visualize o resultado antes de exportar</CardDescription>
                    </div>
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Transcrito
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <VideoPreview
                    videoFile={videoFile}
                    words={words}
                    duration={transcription.duration}
                    videoDimensions={videoDimensions}
                  />
                </CardContent>
              </Card>

              {/* Transcription editor */}
              <Card>
                <CardHeader>
                  <CardTitle>Transcrição</CardTitle>
                  <CardDescription>Revise e edite os segmentos antes de exportar</CardDescription>
                </CardHeader>
                <CardContent>
                  <TranscriptionView
                    segments={segments}
                    language={transcription.language}
                    duration={transcription.duration}
                    onSegmentsChange={handleSegmentsChange}
                  />
                </CardContent>
              </Card>

              {/* Export action */}
              <div className="flex justify-end">
                <Button size="lg" onClick={handleRender} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Renderizar e Exportar MP4
                </Button>
              </div>
            </>
          )}

          {/* Rendering */}
          {step === "rendering" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-6 py-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-[#00c4f0]/10 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-[#00c4f0] animate-spin" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white">Renderizando vídeo...</p>
                      <p className="text-xs text-white/40 mt-1">
                        Processando com FFmpeg • {renderProgress}%
                      </p>
                    </div>
                  </div>
                  <Progress value={renderProgress} className="mx-auto w-full max-w-xs" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Done */}
          {step === "done" && downloadUrl && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-6 py-6">
                  <div className="h-14 w-14 rounded-full bg-emerald-400/10 flex items-center justify-center border border-emerald-400/20">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-white">Vídeo pronto!</p>
                    <p className="text-sm text-white/40 mt-1">
                      Seu vídeo foi renderizado com as legendas animadas
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={downloadUrl}
                      download="video-legendado.mp4"
                      className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base rounded-lg font-medium bg-[#00c4f0] text-black hover:bg-[#00b0d8] shadow-[0_0_16px_rgba(0,196,240,0.3)] transition-all"
                    >
                      <Download className="h-4 w-4" />
                      Baixar MP4
                    </a>
                    <Button variant="outline" size="lg" onClick={reset}>
                      <RotateCcw className="h-4 w-4" />
                      Novo vídeo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/6 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-white/25">VideoEditor IA — Fase 1</p>
          <p className="text-xs text-white/25">OpenAI Whisper · FFmpeg · Next.js</p>
        </div>
      </footer>
    </div>
  );
}
