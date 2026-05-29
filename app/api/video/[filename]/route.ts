import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync } from "fs";
import { Readable } from "stream";
import path from "path";
import os from "os";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!/^input-\d+\.\w+$/.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(os.tmpdir(), "video-editor-ia", filename);

  let fileSize: number;
  try {
    fileSize = statSync(filePath).size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(filename).slice(1).toLowerCase();
  const contentType =
    ext === "mov" ? "video/quicktime" :
    ext === "avi" ? "video/x-msvideo" :
    "video/mp4";

  const rangeHeader = req.headers.get("range");

  if (rangeHeader) {
    const [startStr, endStr] = rangeHeader.replace("bytes=", "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const webStream = Readable.toWeb(
      createReadStream(filePath, { start, end })
    ) as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": contentType,
      },
    });
  }

  const webStream = Readable.toWeb(
    createReadStream(filePath)
  ) as ReadableStream<Uint8Array>;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    },
  });
}
