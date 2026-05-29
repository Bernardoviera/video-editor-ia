import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import os from "os";
import { transcribeVideo } from "@/lib/whisper";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("video") as File | null;

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
  const tmpPath = path.join(tmpDir, `upload-${Date.now()}.${ext}`);

  try {
    const bytes = await file.arrayBuffer();
    await writeFile(tmpPath, Buffer.from(bytes));

    const result = await transcribeVideo(tmpPath);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao transcrever.";
    console.error("[transcribe]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    unlink(tmpPath).catch(() => null);
  }
}
