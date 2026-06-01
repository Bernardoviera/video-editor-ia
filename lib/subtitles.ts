import { writeFile } from 'fs/promises'

export interface Word {
  word: string
  start: number
  end: number
}

function toAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const cs = Math.round((seconds % 1) * 100)
  return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`
}

export async function generateAss(words: Word[], outputPath: string): Promise<void> {
  const GROUP = 5
  const lines: string[] = [
    '[Script Info]',
    'ScriptType: v4.00+',
    'PlayResX: 1080',
    'PlayResY: 1920',
    'WrapStyle: 0',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: Default,Open Sans,52,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,4,0,2,30,30,120,1',
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ]

  for (let i = 0; i < words.length; i += GROUP) {
    const group = words.slice(i, i + GROUP)
    const start = toAssTime(group[0].start)
    const end   = toAssTime(group[group.length - 1].end)

    const text = group.map((w, idx) => {
      const t = w.word.trim().toUpperCase()
      if (idx === group.length - 1) return `{\\c&H3E3EE5&}${t}{\\c&HFFFFFF&}`
      return t
    }).join(' ')

    lines.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`)
  }

  await writeFile(outputPath, lines.join('\n'), 'utf-8')
}
