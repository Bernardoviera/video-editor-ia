import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import os from "os";
import { renderVideoWithSubtitles } from "@/lib/render";
import { TranscriptionWord } from "@/lib/whisper";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("video") as File | null;
  const wordsRaw = formData.get("words") as string | null;
  const durationRaw = formData.get("duration") as string | null;
  const widthRaw = formData.get("width") as string | null;
  const heightRaw = formData.get("height") as string | null;

  if (!file || !wordsRaw || !durationRaw) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  let words: TranscriptionWord[];
  try {
    words = JSON.parse(wordsRaw);
  } catch {
    return NextResponse.json({ error: "Words inválidos." }, { status: 400 });
  }

  const duration = parseFloat(durationRaw);
  const tmpDir = path.join(os.tmpdir(), "video-editor-ia");
  const outputsDir = path.join(process.cwd(), "public", "outputs");
  await mkdir(tmpDir, { recursive: true });
  await mkdir(outputsDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "mp4";
  const inputFilename = `input-${Date.now()}.${ext}`;
  const tmpInput = path.join(tmpDir, inputFilename);
  const outputFilename = `output-${Date.now()}.mp4`;
  const outputPath = path.join(outputsDir, outputFilename);

  const host = req.headers.get("host") ?? "localhost:3000";
  const videoUrl = `http://${host}/api/video/${inputFilename}`;

  try {
    const bytes = await file.arrayBuffer();
    await writeFile(tmpInput, Buffer.from(bytes));

    await renderVideoWithSubtitles({
      videoPath: videoUrl,
      words,
      duration,
      width: widthRaw ? parseInt(widthRaw, 10) : undefined,
      height: heightRaw ? parseInt(heightRaw, 10) : undefined,
      outputPath,
    });

    return NextResponse.json({ url: `/outputs/${outputFilename}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao renderizar.";
    console.error("[render]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    unlink(tmpInput).catch(() => null);
  }
}
