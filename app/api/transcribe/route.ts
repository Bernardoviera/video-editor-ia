import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import os from "os";
import { transcribeVideo } from "@/lib/whisper";
import { detectSilences, getSpeechSegments, removeSilences as stripSilences } from "@/lib/silence";
import { getVideoDuration } from "@/lib/video";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("video") as File | null;
  const shouldRemoveSilences = formData.get("removeSilences") !== "false";

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const allowed = ["video/mp4", "video/quicktime", "video/x-msvideo"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Formato de vídeo não suportado." }, { status: 400 });
  }

  const tmpDir = path.join(os.tmpdir(), "video-editor-ia");
  await mkdir(tmpDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "mp4";
  const timestamp = Date.now().toString();
  const tmpPath = path.join(tmpDir, `upload-${timestamp}.${ext}`);
  const processedPath = path.join(tmpDir, `processed-${timestamp}.mp4`);

  let transcribeTarget = tmpPath;

  try {
    const bytes = await file.arrayBuffer();
    await writeFile(tmpPath, Buffer.from(bytes));

    if (shouldRemoveSilences) {
      try {
        const duration = await getVideoDuration(tmpPath);
        const silences  = await detectSilences(tmpPath);
        const segments  = getSpeechSegments(silences, duration);
        await stripSilences(tmpPath, processedPath, segments);
        transcribeTarget = processedPath;
        console.log(`[transcribe] silences removed: ${silences.length} silence(s), ${segments.length} speech segment(s)`);
      } catch (silenceErr) {
        console.warn("[transcribe] silence removal failed, using original:", silenceErr);
      }
    }

    const result = await transcribeVideo(transcribeTarget);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao transcrever.";
    console.error("[transcribe]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    unlink(tmpPath).catch(() => null);
    unlink(processedPath).catch(() => null);
  }
}
