import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import os from "os";
import { renderVideo } from "@/lib/render";
import { TranscriptionWord } from "@/lib/whisper";
import { jobs, cleanupOldJobs } from "@/lib/jobStore";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("video") as File | null;
  const wordsRaw = formData.get("words") as string | null;
  const durationRaw = formData.get("duration") as string | null;

  if (!file || !wordsRaw || !durationRaw) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  let words: TranscriptionWord[];
  try {
    words = JSON.parse(wordsRaw);
  } catch {
    return NextResponse.json({ error: "Words inválidos." }, { status: 400 });
  }

  cleanupOldJobs();

  const jobId = crypto.randomUUID();
  const timestamp = Date.now().toString();
  const tmpDir = path.join(os.tmpdir(), "video-editor-ia");
  await mkdir(tmpDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "mp4";
  const inputFilename = `input-${timestamp}.${ext}`;
  const tmpInput = path.join(tmpDir, inputFilename);

  try {
    const bytes = await file.arrayBuffer();
    await writeFile(tmpInput, Buffer.from(bytes));
  } catch {
    return NextResponse.json({ error: "Erro ao salvar arquivo." }, { status: 500 });
  }

  jobs.set(jobId, { status: "processing", createdAt: Date.now() });

  renderVideo(tmpInput, words, timestamp)
    .then(({ filePath }) => {
      jobs.set(jobId, { status: "done", filePath, createdAt: Date.now() });
    })
    .catch((err) => {
      jobs.set(jobId, {
        status: "error",
        error: err instanceof Error ? err.message : "Erro desconhecido.",
        createdAt: Date.now(),
      });
    })
    .finally(() => {
      unlink(tmpInput).catch(() => null);
    });

  return NextResponse.json({ jobId });
}
