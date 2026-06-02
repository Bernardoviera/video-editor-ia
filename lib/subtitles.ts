import { writeFile } from 'fs/promises'
import type { CaptionStyle } from './animationTypes'

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
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

// ASS colour = &H00BBGGRR (no alpha, BGR order)
// bold  → yellow  #FFE600 → R=FF G=E6 B=00 → &H0000E6FF&
// bounce → red    #E53E3E → R=E5 G=3E B=3E → &H003E3EE5&
// clean  → cyan   #00C4F0 → R=00 G=C4 B=F0 → &H00F0C400&
const ACTIVE_COLOUR: Record<CaptionStyle, string> = {
  bold:   '{\\c&H0000E6FF&}',
  bounce: '{\\c&H003E3EE5&}',
  clean:  '{\\c&H00F0C400&}',
}
const RESET_COLOUR = '{\\c&H00FFFFFF&}'

// Style line: Name, Fontname, Fontsize, Primary, Secondary, Outline, Back,
//             Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing,
//             Angle, BorderStyle, Outline, Shadow, Alignment,
//             MarginL, MarginR, MarginV, Encoding
const STYLE_LINES: Record<CaptionStyle, string> = {
  bold:   'Style: Default,Open Sans,90,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,6,0,2,30,30,120,1',
  bounce: 'Style: Default,Open Sans,78,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,4,0,2,30,30,120,1',
  clean:  'Style: Default,Inter,58,&H00FFFFFF,&H000000FF,&H00000000,&H40000000,0,0,0,0,100,100,0,0,1,2,2,2,30,30,140,1',
}

export async function generateAss(
  words: Word[],
  outputPath: string,
  captionStyle: CaptionStyle = 'bounce'
): Promise<void> {
  const GROUP = 5
  const activeColour = ACTIVE_COLOUR[captionStyle]

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
    STYLE_LINES[captionStyle],
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ]

  for (let i = 0; i < words.length; i += GROUP) {
    const group = words.slice(i, i + GROUP)
    const nextGroupFirstStart = i + GROUP < words.length ? words[i + GROUP].start : null

    for (let j = 0; j < group.length; j++) {
      const word = group[j]
      const start = toAssTime(word.start)

      let endTime: number
      if (j < group.length - 1) {
        endTime = group[j + 1].start
      } else if (nextGroupFirstStart !== null) {
        endTime = nextGroupFirstStart
      } else {
        endTime = word.end + 0.5
      }
      const end = toAssTime(endTime)

      const text = group
        .map((w, idx) => {
          const t = w.word.trim().toUpperCase()
          if (idx === j) return `${activeColour}${t}${RESET_COLOUR}`
          return t
        })
        .join(' ')

      lines.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`)
    }
  }

  await writeFile(outputPath, lines.join('\n'), 'utf-8')
}
