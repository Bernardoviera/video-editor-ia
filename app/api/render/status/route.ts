import { NextRequest, NextResponse } from "next/server";
import { jobs } from "@/lib/jobStore";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ status: "error", error: "jobId ausente." }, { status: 400 });
  }

  const job = jobs.get(jobId);
  if (!job) {
    return NextResponse.json({ status: "error", error: "Job não encontrado." });
  }

  return NextResponse.json({ status: job.status, error: job.error });
}
