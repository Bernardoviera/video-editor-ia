import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import os from "os";
import { renderVideo } from "@/lib/render";
import { TranscriptionWord } from "@/lib/whisper";
import { jobs, cleanupOldJobs } from "@/lib/jobStore";
import type { AnimationEvent, CaptionStyle } from "@/lib/animationTypes";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file         = formData.get("video") as File | null;
  const wordsRaw     = formData.get("words") as string | null;
  const durationRaw  = formData.get("duration") as string | null;
  const widthRaw     = formData.get("width") as string | null;
  const heightRaw    = formData.get("height") as string | null;
  const eventsRaw    = formData.get("animationEvents") as string | null;
  const styleRaw     = formData.get("captionStyle") as string | null;

  if (!file || !wordsRaw || !durationRaw) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  let words: TranscriptionWord[];
  try {
    words = JSON.parse(wordsRaw);
  } catch {
    return NextResponse.json({ error: "Words inválidos." }, { status: 400 });
  }

  let animationEvents: AnimationEvent[] = [];
  if (eventsRaw) {
    try { animationEvents = JSON.parse(eventsRaw); } catch { /* ignore */ }
  }

  const VALID_STYLES: CaptionStyle[] = ["bold", "bounce", "clean"];
  const captionStyle: CaptionStyle =
    VALID_STYLES.includes(styleRaw as CaptionStyle)
      ? (styleRaw as CaptionStyle)
      : "bounce";

  cleanupOldJobs();

  const jobId    = crypto.randomUUID();
  const timestamp = Date.now().toString();
  const tmpDir   = path.join(os.tmpdir(), "video-editor-ia");
  await mkdir(tmpDir, { recursive: true });

  const ext           = file.name.split(".").pop() ?? "mp4";
  const inputFilename = `input-${timestamp}.${ext}`;
  const tmpInput      = path.join(tmpDir, inputFilename);

  try {
    const bytes = await file.arrayBuffer();
    await writeFile(tmpInput, Buffer.from(bytes));
  } catch {
    return NextResponse.json({ error: "Erro ao salvar arquivo." }, { status: 500 });
  }

  console.log(`[render] Criando job. Map ref: ${jobs}, size antes: ${jobs.size}`);
  jobs.set(jobId, { status: "processing", createdAt: Date.now() });
  console.log(`[render] Job criado: ${jobId}, jobs existentes: ${[...jobs.keys()]}`);

  renderVideo({
    inputPath: tmpInput,
    words,
    timestamp,
    captionStyle,
    animationEvents,
    width:    widthRaw    ? parseInt(widthRaw, 10)    : undefined,
    height:   heightRaw   ? parseInt(heightRaw, 10)   : undefined,
    duration: durationRaw ? parseFloat(durationRaw)   : undefined,
  })
    .then(({ filePath }) => {
      jobs.set(jobId, { status: "done", filePath, createdAt: Date.now() });
    })
    .catch((err) => {
      console.error('[render] RENDER CRASH:', err);
      jobs.set(jobId, {
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        createdAt: Date.now(),
      });
    })
    .finally(() => {
      unlink(tmpInput).catch(() => null);
    });

  return NextResponse.json({ jobId });
}
