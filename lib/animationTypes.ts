export type CaptionStyle = 'bold' | 'bounce' | 'clean'

export type TemplateName =
  | 'LabelOverlay'   // kinetic-slam: palavra gigante, 4 entradas, impacto
  | 'PillKaraoke'    // legenda em pílula estilo Reels, neutra/explicativa
  | 'MatrixDecode'   // decode verde estilo hacker, tecnologia/revelação
  | 'GradientFill'   // gradiente Siri, premium/emocional
  | 'TerminalCode'   // terminal macOS digitando, código/tech/dev
  | 'SyncedCaption'  // legenda sincronizada palavra-a-palavra (estilo TikTok)

// Templates que já exibem o texto falado — suprimem a legenda ASS na sua janela.
export const SUBTITLE_SUPPRESS_TEMPLATES: TemplateName[] = ['SyncedCaption']

// Token de legenda com tempos RELATIVOS ao início do evento (ms).
// Preenchido no servidor a partir do timestamp por-palavra do Whisper.
export interface CaptionToken {
  text:   string
  fromMs: number
  toMs:   number
}

export interface TemplateProps {
  title?:          string
  subtitle?:       string
  highlightWords?: number[]      // índices das palavras (title+subtitle) a destacar
  accentColor?:    string        // cor de destaque (default por template)
  tokens?:         CaptionToken[] // legenda sincronizada (quando disponível)
}

export interface AnimationEvent {
  id:        string
  template:  TemplateName
  startTime: number   // seconds
  duration:  number   // seconds
  props:     TemplateProps
}

export interface TemplateInfo {
  name:         TemplateName
  label:        string
  icon:         string
  desc:         string
  defaultProps: TemplateProps
}

export const TEMPLATE_CATALOG: TemplateInfo[] = [
  {
    name:         'LabelOverlay',
    label:        'Kinetic Slam',
    icon:         '💥',
    desc:         'Palavra gigante por vez (Anton), 4 entradas com impacto. Momentos de punch.',
    defaultProps: { title: 'FRASE DE IMPACTO', subtitle: 'complemento do que foi dito' },
  },
  {
    name:         'PillKaraoke',
    label:        'Pill Karaoke',
    icon:         '💊',
    desc:         'Legenda em pílula estilo Reels (Poppins). Narração neutra/explicativa.',
    defaultProps: { title: '', subtitle: 'legenda estilo reels' },
  },
  {
    name:         'MatrixDecode',
    label:        'Matrix Decode',
    icon:         '🟩',
    desc:         'Texto verde que decodifica (Space Grotesk). Tecnologia/revelação.',
    defaultProps: { title: '', subtitle: 'decodificando' },
  },
  {
    name:         'GradientFill',
    label:        'Gradient Fill',
    icon:         '🌈',
    desc:         'Gradiente Siri varrendo o texto (Montserrat). Premium/emocional.',
    defaultProps: { title: '', subtitle: 'momento premium' },
  },
  {
    name:         'TerminalCode',
    label:        'Terminal Code',
    icon:         '🖥️',
    desc:         'Janela de terminal macOS digitando linha a linha (JetBrains Mono). Código/tech/dev.',
    defaultProps: { title: 'npm run build', subtitle: 'Build concluído com sucesso' },
  },
  {
    name:         'SyncedCaption',
    label:        'Synced Caption',
    icon:         '🎯',
    desc:         'Legenda sincronizada palavra-a-palavra com a fala (estilo TikTok, @remotion/captions). A palavra acende quando é dita.',
    defaultProps: { subtitle: 'legenda sincronizada' },
  },
]
