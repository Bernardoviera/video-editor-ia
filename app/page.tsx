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
  Wand2,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react";
import dynamic from "next/dynamic";

import { VideoUpload } from "@/components/VideoUpload";
import { TranscriptionView } from "@/components/TranscriptionView";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TranscriptionResult,
  TranscriptionSegment,
  TranscriptionWord,
} from "@/lib/whisper";
import type {
  AnimationEvent,
  CaptionStyle,
  TemplateName,
  TemplateProps,
} from "@/lib/animationTypes";
import { TEMPLATE_CATALOG } from "@/lib/animationTypes";

const VideoPreview = dynamic(
  () => import("@/components/VideoPreview").then((m) => m.VideoPreview),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[9/16] w-full rounded-xl bg-white/4 animate-pulse" />
    ),
  }
);

type Step =
  | "idle"
  | "transcribing"
  | "review"
  | "rendering"
  | "done"
  | "error";

const TEMPLATE_LABEL: Record<TemplateName, string> = Object.fromEntries(
  TEMPLATE_CATALOG.map((t) => [t.name, `${t.icon} ${t.label}`])
) as Record<TemplateName, string>;

const CAPTION_STYLES: { key: CaptionStyle; label: string; desc: string }[] = [
  { key: "bold",   label: "BOLD",   desc: "ALL CAPS, outline pesado" },
  { key: "bounce", label: "BOUNCE", desc: "Palavra ativa em vermelho" },
  { key: "clean",  label: "CLEAN",  desc: "Fade suave, minimalista" },
];

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function getVideoDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const vid = document.createElement("video");
    vid.preload = "metadata";
    vid.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ width: vid.videoWidth || 1080, height: vid.videoHeight || 1920 });
    };
    vid.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 1080, height: 1920 });
    };
    vid.src = url;
  });
}

export default function Home() {
  // ── core state ──────────────────────────────────────────────────────────────
  const [step, setStep]             = useState<Step>("idle");
  const [videoFile, setVideoFile]   = useState<File | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 1080, height: 1920 });
  const [transcription, setTranscription]     = useState<TranscriptionResult | null>(null);
  const [segments, setSegments]     = useState<TranscriptionSegment[]>([]);
  const [words, setWords]           = useState<TranscriptionWord[]>([]);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);

  // ── upload options ───────────────────────────────────────────────────────────
  const [removeSilencesEnabled, setRemoveSilencesEnabled] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("bounce");
  const [userPrompt, setUserPrompt]     = useState("");
  const [transcribeMsg, setTranscribeMsg] = useState("Transcrevendo com Whisper...");

  // ── animation state ──────────────────────────────────────────────────────────
  const [animationEvents, setAnimationEvents] = useState<AnimationEvent[]>([]);
  const [isAnalyzing, setIsAnalyzing]         = useState(false);
  const [analyzeError, setAnalyzeError]       = useState<string | null>(null);
  const [showAddForm, setShowAddForm]         = useState(false);
  const [newTemplate, setNewTemplate]         = useState<TemplateName>("DarkReveal");
  const [newStartTime, setNewStartTime]       = useState(0);
  const [newDuration, setNewDuration]         = useState(2);
  const [newProps, setNewProps]               = useState<TemplateProps>({});

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  // ── upload / transcribe ──────────────────────────────────────────────────────
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
      const res  = await fetch("/api/transcribe", { method: "POST", body: fd });
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

  // ── segment editing ──────────────────────────────────────────────────────────
  const handleSegmentsChange = useCallback(
    (updated: TranscriptionSegment[]) => {
      setSegments(updated);
      const idx = updated.findIndex((s, i) => s.text !== segments[i]?.text);
      if (idx === -1) return;
      const seg    = updated[idx];
      const tokens = seg.text.trim().split(/\s+/).filter(Boolean);
      const outside = words.filter((w) => w.end <= seg.start || w.start >= seg.end);
      if (!tokens.length) { setWords(outside); return; }
      const dt = (seg.end - seg.start) / tokens.length;
      setWords(
        [...outside, ...tokens.map((word, i) => ({
          word, start: seg.start + i * dt, end: seg.start + (i + 1) * dt,
        }))].sort((a, b) => a.start - b.start)
      );
    },
    [segments, words]
  );

  // ── AI analyze ───────────────────────────────────────────────────────────────
  const runAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res  = await fetch("/api/analyze", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ segments, userPrompt, captionStyle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na análise.");
      setAnimationEvents(data.events ?? []);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [segments, userPrompt, captionStyle]);

  // ── event CRUD ───────────────────────────────────────────────────────────────
  const deleteEvent = (id: string) =>
    setAnimationEvents((p) => p.filter((e) => e.id !== id));

  const updateEvent = (id: string, patch: Partial<AnimationEvent>) =>
    setAnimationEvents((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const addEvent = () => {
    const defaultProps = TEMPLATE_CATALOG.find((t) => t.name === newTemplate)?.defaultProps ?? {};
    const event: AnimationEvent = {
      id:        `manual-${Date.now()}`,
      template:  newTemplate,
      startTime: newStartTime,
      duration:  newDuration,
      props:     { ...defaultProps, ...newProps },
    };
    setAnimationEvents((p) =>
      [...p, event].sort((a, b) => a.startTime - b.startTime)
    );
    setShowAddForm(false);
    setNewProps({});
  };

  // ── render ───────────────────────────────────────────────────────────────────
  const handleRender = useCallback(async () => {
    if (!videoFile || !transcription) return;
    setStep("rendering");
    setRenderProgress(0);

    try {
      const fd = new FormData();
      fd.append("video",           videoFile);
      fd.append("words",           JSON.stringify(words));
      fd.append("duration",        String(transcription.duration));
      fd.append("width",           String(videoDimensions.width));
      fd.append("height",          String(videoDimensions.height));
      fd.append("captionStyle",    captionStyle);
      fd.append("animationEvents", JSON.stringify(animationEvents));

      const res = await fetch("/api/render", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao iniciar render.");
      }
      const { jobId } = await res.json();

      pollingRef.current = setInterval(async () => {
        try {
          const sr = await fetch(`/api/render/status?jobId=${jobId}`);
          const { status, error } = await sr.json();

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

          setRenderProgress(100);
          const dlRes = await fetch(`/api/render/download?jobId=${jobId}`);
          if (!dlRes.ok) throw new Error("Erro ao baixar o vídeo.");
          const blob = await dlRes.blob();
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement("a");
          a.href = url; a.download = "video-legendado.mp4"; a.click();
          setDownloadUrl(url);
          setStep("done");
        } catch (pe) {
          if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
          setErrorMsg(pe instanceof Error ? pe.message : "Erro desconhecido.");
          setStep("error");
        }
      }, 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido.");
      setStep("error");
    }
  }, [videoFile, transcription, words, videoDimensions, captionStyle, animationEvents]);

  // ── reset ────────────────────────────────────────────────────────────────────
  const reset = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setStep("idle"); setVideoFile(null);
    setVideoDimensions({ width: 1080, height: 1920 });
    setTranscription(null); setSegments([]); setWords([]);
    setRenderProgress(0); setDownloadUrl(null); setErrorMsg(null);
    setAnimationEvents([]); setIsAnalyzing(false); setAnalyzeError(null);
    setUserPrompt(""); setShowAddForm(false);
    setNewTemplate("DarkReveal"); setNewStartTime(0); setNewDuration(2); setNewProps({});
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/6 bg-[#050508]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#00c4f0] flex items-center justify-center">
              <FileVideo className="h-3.5 w-3.5 text-black" />
            </div>
            <span className="font-semibold text-sm tracking-tight">VideoEditor IA</span>
            <Badge variant="secondary" className="text-[10px]">Beta</Badge>
          </div>
          {step !== "idle" && (
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
              <RotateCcw className="h-3 w-3" /> Novo vídeo
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        {step === "idle" && (
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00c4f0]/10 border border-[#00c4f0]/20 text-[#00c4f0] text-xs font-medium mb-6">
              <Sparkles className="h-3 w-3" />
              Powered by OpenAI Whisper + GPT-4 + FFmpeg
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
              Editor de Vídeo com IA
            </h1>
            <p className="text-white/50 max-w-lg mx-auto">
              Upload → Transcrição → Animações geradas por IA com preview em tempo real → Export
            </p>
          </div>
        )}

        <div className="grid gap-6">

          {/* ── Upload ──────────────────────────────────────────────────────── */}
          {(step === "idle" || step === "error") && (
            <Card>
              <CardHeader>
                <CardTitle>Upload de Vídeo</CardTitle>
                <CardDescription>Arraste ou selecione um arquivo MP4, MOV ou AVI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <VideoUpload onUpload={handleUpload} />

                {/* Caption style */}
                <div>
                  <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">Estilo de legenda</p>
                  <div className="grid grid-cols-3 gap-2">
                    {CAPTION_STYLES.map(({ key, label, desc }) => (
                      <button
                        key={key}
                        onClick={() => setCaptionStyle(key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          captionStyle === key
                            ? "border-[#00c4f0] bg-[#00c4f0]/10"
                            : "border-white/10 bg-white/4 hover:border-white/20"
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{label}</div>
                        <div className="text-[10px] text-white/40 mt-0.5 leading-tight">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI prompt */}
                <div>
                  <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wide">Instruções para a IA (opcional)</p>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="Ex: Foco nos momentos de impacto, use emojis de negócios, destaque números e estatísticas"
                    rows={2}
                    className="w-full p-3 rounded-xl bg-white/4 border border-white/10 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:border-[#00c4f0]/50 transition-colors"
                  />
                </div>

                {/* Silence toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                  <input
                    type="checkbox"
                    checked={removeSilencesEnabled}
                    onChange={(e) => setRemoveSilencesEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#00c4f0]"
                  />
                  <span className="text-sm text-white/50">Remover silêncios automaticamente</span>
                </label>

                {step === "error" && errorMsg && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
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

          {/* ── Transcribing ────────────────────────────────────────────────── */}
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

          {/* ── Review — player + animações lado a lado ─────────────────────── */}
          {step === "review" && transcription && videoFile && (
            <div className="grid gap-6 lg:grid-cols-5">

              {/* Player — left 2 cols (vertical video) */}
              <div className="lg:col-span-2">
                <div className="sticky top-20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-white/50 uppercase tracking-wide">Preview em tempo real</p>
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Transcrito
                    </Badge>
                  </div>
                  <VideoPreview
                    videoFile={videoFile}
                    words={words}
                    duration={transcription.duration}
                    videoDimensions={videoDimensions}
                    events={animationEvents}
                    captionStyle={captionStyle}
                  />
                  <p className="text-[10px] text-white/25 text-center mt-2">
                    As animações atualizam automaticamente ao editar a lista
                  </p>
                </div>
              </div>

              {/* Controls — right 3 cols */}
              <div className="lg:col-span-3 space-y-4">

                {/* Transcription editor */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Transcrição</CardTitle>
                    <CardDescription>Edite os segmentos se necessário</CardDescription>
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

                {/* Animations */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Animações IA</CardTitle>
                        <CardDescription>
                          {animationEvents.length > 0
                            ? `${animationEvents.length} animação(ões) • edite na lista abaixo`
                            : "Clique em Analisar para gerar sugestões"}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={runAnalyze}
                        disabled={isAnalyzing}
                        className="gap-1.5 shrink-0"
                      >
                        {isAnalyzing
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Wand2 className="h-3.5 w-3.5" />}
                        {isAnalyzing ? "Analisando..." : animationEvents.length > 0 ? "Regenerar" : "Analisar com IA"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5">

                    {analyzeError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {analyzeError}
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#00c4f0]/5 border border-[#00c4f0]/10 text-xs text-white/50">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00c4f0]" />
                        Identificando momentos de impacto...
                      </div>
                    )}

                    {!isAnalyzing && animationEvents.length === 0 && !analyzeError && (
                      <p className="text-xs text-white/30 text-center py-3">
                        Nenhuma animação adicionada ainda
                      </p>
                    )}

                    {animationEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/4 border border-white/8"
                      >
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white">
                              {TEMPLATE_LABEL[event.template]}
                            </span>
                            <span className="text-[10px] text-white/40">
                              {fmtTime(event.startTime)} → {fmtTime(event.startTime + event.duration)}
                            </span>
                          </div>
                          {/* Text prop */}
                          <input
                            type="text"
                            value={event.props.text ?? ""}
                            onChange={(e) =>
                              updateEvent(event.id, { props: { ...event.props, text: e.target.value } })
                            }
                            placeholder="Texto principal"
                            className="w-full px-2 py-1 rounded-lg bg-white/6 border border-white/10 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#00c4f0]/50"
                          />
                          <div className="flex items-center gap-2 text-[10px] text-white/40">
                            <label>Início</label>
                            <input
                              type="number"
                              value={event.startTime}
                              step={0.5} min={0}
                              onChange={(e) =>
                                updateEvent(event.id, { startTime: parseFloat(e.target.value) || 0 })
                              }
                              className="w-14 px-1.5 py-0.5 rounded-md bg-white/6 border border-white/10 text-xs text-white focus:outline-none"
                            />
                            <label>Dur.</label>
                            <input
                              type="number"
                              value={event.duration}
                              step={0.5} min={1.5} max={4}
                              onChange={(e) =>
                                updateEvent(event.id, { duration: parseFloat(e.target.value) || 2 })
                              }
                              className="w-14 px-1.5 py-0.5 rounded-md bg-white/6 border border-white/10 text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="text-white/25 hover:text-red-400 transition-colors mt-0.5 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add form */}
                    {showAddForm ? (
                      <div className="p-2.5 rounded-xl bg-white/4 border border-[#00c4f0]/20 space-y-2">
                        <p className="text-xs font-medium text-white">Nova animação</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={newTemplate}
                            onChange={(e) => {
                              const t = e.target.value as TemplateName
                              setNewTemplate(t)
                              setNewProps(TEMPLATE_CATALOG.find((c) => c.name === t)?.defaultProps ?? {})
                            }}
                            className="px-2 py-1.5 rounded-lg bg-[#0d0d12] border border-white/10 text-xs text-white focus:outline-none col-span-2"
                          >
                            {TEMPLATE_CATALOG.map((t) => (
                              <option key={t.name} value={t.name}>{t.icon} {t.label} — {t.desc}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Texto principal"
                            value={newProps.text ?? ""}
                            onChange={(e) => setNewProps((p) => ({ ...p, text: e.target.value }))}
                            className="px-2 py-1 rounded-lg bg-white/6 border border-white/10 text-xs text-white placeholder-white/25 focus:outline-none col-span-2"
                          />
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-white/40 shrink-0">Início (s)</label>
                            <input
                              type="number" value={newStartTime} step={0.5} min={0}
                              onChange={(e) => setNewStartTime(parseFloat(e.target.value) || 0)}
                              className="flex-1 px-2 py-1 rounded-lg bg-white/6 border border-white/10 text-xs text-white focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-white/40 shrink-0">Dur. (s)</label>
                            <input
                              type="number" value={newDuration} step={0.5} min={1.5} max={4}
                              onChange={(e) => setNewDuration(parseFloat(e.target.value) || 2)}
                              className="flex-1 px-2 py-1 rounded-lg bg-white/6 border border-white/10 text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={addEvent} className="gap-1">
                            <Plus className="h-3 w-3" /> Adicionar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors py-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Adicionar animação manualmente
                      </button>
                    )}
                  </CardContent>
                </Card>

                {/* Render button */}
                <div className="flex justify-end">
                  <Button size="lg" onClick={handleRender} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    {animationEvents.length > 0
                      ? `Renderizar com ${animationEvents.length} animação(ões)`
                      : "Renderizar vídeo"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Rendering ───────────────────────────────────────────────────── */}
          {step === "rendering" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-6 py-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#00c4f0]/10 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-[#00c4f0] animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white">Renderizando vídeo...</p>
                      <p className="text-xs text-white/40 mt-1">
                        Processando com FFmpeg{animationEvents.length > 0 ? " + Remotion" : ""} • {renderProgress}%
                      </p>
                    </div>
                  </div>
                  <Progress value={renderProgress} className="mx-auto w-full max-w-xs" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Done ────────────────────────────────────────────────────────── */}
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
                      Seu vídeo foi renderizado com legendas{animationEvents.length > 0 ? " e animações" : ""}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={downloadUrl}
                      download="video-legendado.mp4"
                      className="inline-flex items-center justify-center gap-2 h-12 px-6 text-base rounded-lg font-medium bg-[#00c4f0] text-black hover:bg-[#00b0d8] shadow-[0_0_16px_rgba(0,196,240,0.3)] transition-all"
                    >
                      <Download className="h-4 w-4" /> Baixar MP4
                    </a>
                    <Button variant="outline" size="lg" onClick={reset}>
                      <RotateCcw className="h-4 w-4" /> Novo vídeo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="border-t border-white/6 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-white/25">VideoEditor IA — Fase 3</p>
          <p className="text-xs text-white/25">OpenAI Whisper · GPT-4 · FFmpeg · Remotion · Next.js</p>
        </div>
      </footer>
    </div>
  );
}
