import path from "path";
import os from "os";
import fs from "fs";
import { TranscriptionWord } from "./whisper";

export function getBaseUrl(): string {
  const port = process.env.PORT ?? 3000;
  return process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${port}`;
}

export interface RenderOptions {
  videoPath: string;
  words: TranscriptionWord[];
  duration: number;
  width?: number;
  height?: number;
  outputPath?: string;
}

export async function renderVideoWithSubtitles(options: RenderOptions): Promise<string> {
  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition, ensureBrowser } = await import("@remotion/renderer");

  const outputPath = options.outputPath ?? path.join(os.tmpdir(), `output-${Date.now()}.mp4`);
  const entryPoint = path.join(process.cwd(), "remotion", "index.tsx");
  const fps = 15;
  const durationInFrames = Math.ceil(options.duration * fps) + fps;

  const inputProps = {
    videoSrc: options.videoPath,
    words: options.words,
  };

  console.log("[render] Ensuring browser...");
  await ensureBrowser();

  console.log("[render] Bundling entry point...");
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => ({
      ...config,
      module: {
        ...config.module,
        rules: [
          ...(config.module?.rules ?? []),
          { test: /\.md$/, use: "null-loader" },
        ],
      },
    }),
  });
  console.log("[render] Bundle done:", bundleLocation);

  console.log("[render] Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "SubtitleVideo",
    inputProps,
  });
  console.log("[render] Composition selected. Frames:", durationInFrames);

  console.log("[render] Starting renderMedia...");
  await renderMedia({
    composition: {
      ...composition,
      durationInFrames,
      fps,
      width: options.width ?? 1080,
      height: options.height ?? 1920,
    },
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    timeoutInMilliseconds: 120000,
    concurrency: 2,
    disallowParallelEncoding: true,
    onProgress: ({ renderedFrames, encodedFrames, encodedDoneIn, renderedDoneIn, stitchStage }) => {
      console.log(
        `[render] rendered=${renderedFrames}/${durationInFrames}` +
        ` encoded=${encodedFrames}` +
        ` stage=${stitchStage ?? "-"}` +
        ` renderedDoneIn=${renderedDoneIn ?? "-"}ms` +
        ` encodedDoneIn=${encodedDoneIn ?? "-"}ms`
      );
    },
  });

  console.log("[render] renderMedia complete. Output:", outputPath);
  return outputPath;
}

export function cleanupFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore cleanup errors
  }
}
