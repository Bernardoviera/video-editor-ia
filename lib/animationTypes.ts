export type CaptionStyle = 'bold' | 'bounce' | 'clean'

export type TemplateName = 'LabelOverlay'

export const SUBTITLE_SUPPRESS_TEMPLATES: TemplateName[] = []

export interface TemplateProps {
  title?:         string
  subtitle?:      string
  // props of legacy templates (files kept on disk, not exposed in UI)
  text?:          string
  accentColor?:   string
  color?:         string
  fontSize?:      number
  value?:         string
  category?:      string
  context?:       string
  icon?:          string
  label?:         string
  accent?:        string
  lineColor?:     string
  glitchColor?:   string
  popColor?:      string
  staggerDelay?:  number
  direction?:     'left' | 'right' | 'top' | 'bottom'
  blur?:          number
  startTracking?: number
  baseColor?:     string
  shineColor?:    string
  fillColor?:     string
  waveSpeed?:     number
  body?:          string
  cardPosition?:  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
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
    label:        'Label Overlay',
    icon:         '🏷️',
    desc:         'Título branco + subtítulo vermelho com spring',
    defaultProps: { title: 'FRASE DE IMPACTO', subtitle: 'complemento do que foi dito' },
  },
]
