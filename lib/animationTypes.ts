export type CaptionStyle = 'bold' | 'bounce' | 'clean'

export type TemplateName =
  | 'LabelOverlay'   // kinetic-slam: palavra gigante, 4 entradas, impacto
  | 'PillKaraoke'    // legenda em pílula estilo Reels, neutra/explicativa
  | 'NeonGlow'       // neon ciano/rosa, hype/energia
  | 'MatrixDecode'   // decode verde estilo hacker, tecnologia/revelação
  | 'GradientFill'   // gradiente Siri, premium/emocional
  | 'TerminalCode'   // terminal macOS digitando, código/tech/dev

export const SUBTITLE_SUPPRESS_TEMPLATES: TemplateName[] = []

export interface TemplateProps {
  title?:          string
  subtitle?:       string
  highlightWords?: number[]  // índices das palavras (title+subtitle) a destacar
  accentColor?:    string    // cor de destaque (default por template)
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
    name:         'NeonGlow',
    label:        'Neon Glow',
    icon:         '🌃',
    desc:         'Neon ciano/rosa com brilho (Outfit). Momentos de hype/energia.',
    defaultProps: { title: '', subtitle: 'energia neon' },
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
]
