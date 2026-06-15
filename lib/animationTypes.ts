export type CaptionStyle = 'bold' | 'bounce' | 'clean'

export type TemplateName = 'LabelOverlay'

export const SUBTITLE_SUPPRESS_TEMPLATES: TemplateName[] = []

export interface TemplateProps {
  title?:          string
  subtitle?:       string
  highlightWords?: number[]  // índices das palavras do subtítulo a destacar em vermelho
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
    desc:         'Kinetic typography — palavras entram com slam, weight shift e morph',
    defaultProps: { title: 'FRASE DE IMPACTO', subtitle: 'complemento do que foi dito' },
  },
]
