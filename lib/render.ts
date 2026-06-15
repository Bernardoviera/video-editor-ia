import { spawn } from 'child_process'
import { mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import ffmpegStatic from 'ffmpeg-static'
import { generateAss, Word } from './subtitles'
import { attachTokens } from './captions'
import type { AnimationEvent, CaptionStyle } from './animationTypes'

export interface RenderOptions {
  inputPath: string
  words: Word[]
  timestamp: string
  captionStyle?: CaptionStyle
  animationEvents?: AnimationEvent[]
  width?: number
  height?: number
  duration?: number
}

function runFFmpeg(args: string[], cwd?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegStatic ?? 'ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'], cwd })
    let stderr = ''
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`FFmpeg saiu com código ${code}:\n${stderr.slice(-800)}`))
    })
    proc.on('error', reject)
  })
}

async function renderRemotionOverlay(options: {
  events: AnimationEvent[]
  overlayPath: string
  width: number
  height: number
  duration: number
}): Promise<void> {
  const { bundle } = await import('@remotion/bundler')
  const { renderMedia, selectComposition, ensureBrowser } = await import('@remotion/renderer')

  await ensureBrowser()

  const entryPoint = path.join(process.cwd(), 'remotion', 'index.tsx')
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => ({
      ...config,
      module: {
        ...config.module,
        rules: [
          ...(config.module?.rules ?? []),
          { test: /\.md$/, use: 'null-loader' },
        ],
      },
    }),
  })

  const fps = 30
  const durationInFrames = Math.ceil(options.duration * fps)
  const inputProps = {
    events: options.events,
    width: options.width,
    height: options.height,
  }

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'AnimationOverlay',
    inputProps,
  })

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames,
      fps,
      width: options.width,
      height: options.height,
    },
    serveUrl: bundleLocation,
    codec: 'vp9',
    imageFormat: 'png',
    pixelFormat: 'yuva420p',
    outputLocation: options.overlayPath,
    inputProps,
    chromiumOptions: { disableWebSecurity: true, gl: 'swiftshader' },
    concurrency: 1,
  })
}

export async function renderVideo(options: RenderOptions): Promise<{ filePath: string }> {
  const {
    inputPath,
    words,
    timestamp,
    captionStyle = 'bounce',
    animationEvents: rawEvents = [],
    width = 1080,
    height = 1920,
    duration,
  } = options

  // Sincroniza cada evento com a fala: anexa tokens (tempos relativos por palavra)
  // derivados do timestamp do Whisper. Templates como SyncedCaption usam isso para
  // acender a palavra exatamente quando é dita.
  const animationEvents = attachTokens(rawEvents, words)

  const outputDir   = tmpdir()
  const assFilename = `sub-${timestamp}.ass`
  const assPath     = path.join(outputDir, assFilename)
  const outPath     = path.join(outputDir, `output-${timestamp}.mp4`)

  if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true })

  await generateAss(words, assPath, captionStyle, animationEvents)

  const effectiveDuration =
    duration ??
    (words.length > 0 ? words[words.length - 1].end + 0.5 : 60)

  const codecArgs = ['-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k']

  try {
    if (animationEvents.length === 0) {
      // ── Fase 1/2 pipeline: FFmpeg + ASS only ─────────────────────────────
      await runFFmpeg(
        ['-y', '-i', inputPath, '-vf', `ass=${assFilename}`, ...codecArgs, outPath],
        outputDir
      )
    } else {
      // ── Fase 3 pipeline: ASS → Remotion overlay → composite ──────────────
      const tempPath    = path.join(outputDir, `temp-${timestamp}.mp4`)
      const overlayPath = path.join(outputDir, `overlay-${timestamp}.webm`)

      // Step 1: burn ASS captions onto original
      await runFFmpeg(
        ['-y', '-i', inputPath, '-vf', `ass=${assFilename}`, ...codecArgs, tempPath],
        outputDir
      )

      // Step 2: render Remotion animation overlay (transparent webm)
      await renderRemotionOverlay({
        events: animationEvents,
        overlayPath,
        width,
        height,
        duration: effectiveDuration,
      })

      // Step 3: overlay the transparent WebM only during animation time ranges.
      // yuva420p alpha ensures transparent pixels outside animations never cover the video.
      // enable= adds a time-based gate as extra protection.
      // Uses gte(t,s)*lte(t,e) instead of between(t,s,e) to avoid comma parsing issues.
      // enable= uses gte(t,s)*lte(t,e) — no backslash escapes (args array, not shell)
      const enableExpr = animationEvents
        .map((e) => {
          const s  = e.startTime.toFixed(3)
          const en = (e.startTime + e.duration).toFixed(3)
          return `gte(t,${s})*lte(t,${en})`
        })
        .join('+')

      await runFFmpeg([
        '-y',
        '-i', tempPath,
        '-i', overlayPath,
        '-filter_complex', `[0:v][1:v]overlay=0:0:enable='${enableExpr}'[vout]`,
        '-map', '[vout]',
        '-map', '0:a',
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
        '-c:a', 'copy',
        outPath,
      ])

      await unlink(tempPath).catch(() => {})
      await unlink(overlayPath).catch(() => {})
    }
  } finally {
    await unlink(assPath).catch(() => {})
  }

  return { filePath: outPath }
}

// Builds a filter_complex that splices [0:v] (base video) and [1:v] (Remotion render)
// using trim+setpts+concat so each time range comes from exactly one source.
// Outside animation events → base video. During events → Remotion output.
function buildSpliceFilter(events: AnimationEvent[], totalDuration: number): string {
  const sorted = [...events].sort((a, b) => a.startTime - b.startTime)

  type Seg = { start: number; end: number; src: 0 | 1 }
  const segs: Seg[] = []
  let cursor = 0

  for (const e of sorted) {
    const eStart = Math.max(cursor, e.startTime)
    const eEnd   = Math.min(e.startTime + e.duration, totalDuration)
    if (eEnd <= eStart) continue

    if (eStart > cursor) segs.push({ start: cursor, end: eStart, src: 0 })
    segs.push({ start: eStart, end: eEnd, src: 1 })
    cursor = eEnd
  }
  if (cursor < totalDuration) segs.push({ start: cursor, end: totalDuration, src: 0 })

  const filters: string[] = []
  const labels: string[] = []

  segs.forEach(({ start, end, src }, i) => {
    const label = `seg${i}`
    filters.push(
      `[${src}:v]trim=start=${start.toFixed(3)}:end=${end.toFixed(3)},setpts=PTS-STARTPTS[${label}]`
    )
    labels.push(`[${label}]`)
  })

  filters.push(`${labels.join('')}concat=n=${segs.length}:v=1[vout]`)
  return filters.join(';')
}
