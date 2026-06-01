import { spawn } from 'child_process'
import { mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import ffmpegStatic from 'ffmpeg-static'
import { generateAss, Word } from './subtitles'

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

export async function renderVideo(
  inputPath: string,
  words: Word[],
  timestamp: string
): Promise<{ filePath: string }> {
  const outputDir  = tmpdir()
  const assFilename = `sub-${timestamp}.ass`
  const assPath     = path.join(outputDir, assFilename)
  const outPath     = path.join(outputDir, `output-${timestamp}.mp4`)

  if (!existsSync(outputDir)) await mkdir(outputDir, { recursive: true })

  await generateAss(words, assPath)

  try {
    await runFFmpeg([
      '-y',
      '-i', inputPath,
      '-vf', `ass=${assFilename}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      outPath,
    ], outputDir)
  } finally {
    await unlink(assPath).catch(() => {})
  }

  return { filePath: outPath }
}
