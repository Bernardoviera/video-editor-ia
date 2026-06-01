import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import os from "os";
import { renderVideo } from "@/lib/render";
import { TranscriptionWord } from "@/lib/whisper";

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

  const timestamp = Date.now().toString();
  const tmpDir = path.join(os.tmpdir(), "video-editor-ia");
  await mkdir(tmpDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "mp4";
  const inputFilename = `input-${timestamp}.${ext}`;
  const tmpInput = path.join(tmpDir, inputFilename);

  try {
    const bytes = await file.arrayBuffer();
    await writeFile(tmpInput, Buffer.from(bytes));

    const { url } = await renderVideo(tmpInput, words, timestamp);

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao renderizar.";
    console.error("[render]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    unlink(tmpInput).catch(() => null);
  }
}
