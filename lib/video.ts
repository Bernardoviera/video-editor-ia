import { spawn } from 'child_process'
import ffmpegStatic from 'ffmpeg-static'

export function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegStatic ?? 'ffmpeg', ['-i', videoPath, '-f', 'null', '-'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stderr = ''
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('close', () => {
      const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/)
      if (!match) return reject(new Error('Não foi possível ler a duração do vídeo'))
      const h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      const s = parseFloat(match[3])
      resolve(h * 3600 + m * 60 + s)
    })
    proc.on('error', reject)
  })
}
