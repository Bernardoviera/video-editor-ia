import type { Word } from './subtitles'
import type { AnimationEvent, CaptionToken } from './animationTypes'

// Seleciona as palavras faladas dentro da janela [startTime, startTime+duration]
// e converte seus tempos para ms relativos ao início da janela.
// É a ponte entre o timestamp por-palavra do Whisper e o estilo TikTok do
// @remotion/captions (palavra acende exatamente quando é dita).
export function tokensForWindow(
  words: Word[],
  startTime: number,
  duration: number,
): CaptionToken[] {
  const endTime = startTime + duration
  const tokens: CaptionToken[] = []

  for (const w of words) {
    // inclui qualquer palavra que se sobreponha à janela
    if (w.end <= startTime || w.start >= endTime) continue
    const text = w.word.trim()
    if (!text) continue
    tokens.push({
      text,
      fromMs: Math.max(0, (w.start - startTime) * 1000),
      toMs:   Math.max(0, (w.end   - startTime) * 1000),
    })
  }

  return tokens
}

// Enriquece os eventos com os tokens sincronizados da sua janela de tempo.
// Eventos sem palavras na janela ficam inalterados (mantêm props originais).
export function attachTokens(
  events: AnimationEvent[],
  words: Word[],
): AnimationEvent[] {
  return events.map((ev) => {
    const tokens = tokensForWindow(words, ev.startTime, ev.duration)
    if (tokens.length === 0) return ev
    return { ...ev, props: { ...ev.props, tokens } }
  })
}
