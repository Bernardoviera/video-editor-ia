import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink } from "fs/promises";
import { jobs } from "@/lib/jobStore";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "jobId ausente." }, { status: 400 });
  }

  const job = jobs.get(jobId);
  if (!job || job.status !== "done" || !job.filePath) {
    return NextResponse.json({ error: "Arquivo não disponível." }, { status: 404 });
  }

  const filePath = job.filePath;
  jobs.delete(jobId);

  const buffer = await readFile(filePath);
  await unlink(filePath).catch(() => {});

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": 'attachment; filename="video-legendado.mp4"',
    },
  });
}
