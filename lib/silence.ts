import { spawn } from 'child_process'
import { copyFile } from 'fs/promises'
import ffmpegStatic from 'ffmpeg-static'

function runFFmpegGetStderr(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegStatic ?? 'ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('close', () => resolve(stderr))
    proc.on('error', reject)
  })
}

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegStatic ?? 'ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`FFmpeg saiu com código ${code}:\n${stderr.slice(-800)}`))
    })
    proc.on('error', reject)
  })
}

export async function detectSilences(
  videoPath: string
): Promise<{ start: number; end: number }[]> {
  const stderr = await runFFmpegGetStderr([
    '-i', videoPath,
    '-af', 'silencedetect=noise=-35dB:d=0.3',
    '-f', 'null', '-',
  ])

  const silences: { start: number; end: number }[] = []
  let currentStart: number | null = null

  for (const line of stderr.split('\n')) {
    const startMatch = line.match(/silence_start:\s*([\d.]+)/)
    const endMatch   = line.match(/silence_end:\s*([\d.]+)/)
    if (startMatch) currentStart = parseFloat(startMatch[1])
    if (endMatch && currentStart !== null) {
      silences.push({ start: currentStart, end: parseFloat(endMatch[1]) })
      currentStart = null
    }
  }

  return silences
}

export function getSpeechSegments(
  silences: { start: number; end: number }[],
  duration: number
): { start: number; end: number }[] {
  const MARGIN      = 0.1
  const MIN_SEGMENT = 0.5
  const sorted = [...silences].sort((a, b) => a.start - b.start)
  const segments: { start: number; end: number }[] = []
  let cursor = 0

  for (const silence of sorted) {
    if (silence.start > cursor) {
      const start = Math.max(0, cursor - MARGIN)
      const end   = Math.min(duration, silence.start + MARGIN)
      if (end - start >= MIN_SEGMENT) segments.push({ start, end })
    }
    cursor = silence.end
  }

  if (cursor < duration) {
    const start = Math.max(0, cursor - MARGIN)
    const end   = duration
    if (end - start >= MIN_SEGMENT) segments.push({ start, end })
  }

  return segments
}

export async function removeSilences(
  inputPath: string,
  outputPath: string,
  segments: { start: number; end: number }[]
): Promise<void> {
  if (segments.length === 0) {
    await copyFile(inputPath, outputPath)
    return
  }

  if (segments.length === 1) {
    const s = segments[0].start.toFixed(6)
    const e = segments[0].end.toFixed(6)
    const filter =
      `[0:v]trim=start=${s}:end=${e},setpts=PTS-STARTPTS[vout];` +
      `[0:a]atrim=start=${s}:end=${e},asetpts=PTS-STARTPTS[aout]`
    await runFFmpeg([
      '-y', '-i', inputPath,
      '-filter_complex', filter,
      '-map', '[vout]', '-map', '[aout]',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      outputPath,
    ])
    return
  }

  const parts: string[] = []
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i].start.toFixed(6)
    const e = segments[i].end.toFixed(6)
    parts.push(`[0:v]trim=start=${s}:end=${e},setpts=PTS-STARTPTS[v${i}]`)
    parts.push(`[0:a]atrim=start=${s}:end=${e},asetpts=PTS-STARTPTS[a${i}]`)
  }
  const inputs = segments.map((_, i) => `[v${i}][a${i}]`).join('')
  parts.push(`${inputs}concat=n=${segments.length}:v=1:a=1[vout][aout]`)

  await runFFmpeg([
    '-y', '-i', inputPath,
    '-filter_complex', parts.join(';'),
    '-map', '[vout]', '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k',
    outputPath,
  ])
}
