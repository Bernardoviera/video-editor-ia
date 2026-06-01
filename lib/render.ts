import { spawn } from 'child_process'
import { mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import ffmpegStatic from 'ffmpeg-static'
import { generateAss, Word } from './subtitles'

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

function escapeFilter(p: string): string {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:')
}

export async function renderVideo(
  inputPath: string,
  words: Word[],
  timestamp: string
): Promise<{ url: string }> {
  const outputDir = path.join(process.cwd(), 'public', 'outputs')
  const assPath   = path.join(outputDir, `sub-${timestamp}.ass`)
  const outPath   = path.join(outputDir, `output-${timestamp}.mp4`)
  const fontsDir  = path.join(process.cwd(), 'public', 'fonts')

  if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true })

  await generateAss(words, assPath)

  try {
    await runFFmpeg([
      '-y',
      '-i', inputPath,
      '-vf', `ass=${escapeFilter(assPath)}:fontsdir=${escapeFilter(fontsDir)}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      outPath,
    ])
  } finally {
    await unlink(assPath).catch(() => {})
  }

  return { url: `/outputs/output-${timestamp}.mp4` }
}

