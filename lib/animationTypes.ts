export type CaptionStyle = 'bold' | 'bounce' | 'clean'

// ── Legacy types kept for AnimationOverlay backward compat ────────────────────
export type AnimationType = 'dark_overlay' | 'text_zoom' | 'emoji_pop' | 'highlight_box' | 'caption_style'
export type Position      = 'center' | 'top' | 'bottom'
export type Intensity     = 'low' | 'medium' | 'high'

// ── Fase 3: Template system ────────────────────────────────────────────────────

export type TemplateName =
  | 'LabelOverlay'
  | 'StatCard'
  | 'MoneyCard'
  | 'DarkReveal'
  | 'ImpactTitle'
  | 'GlitchReveal'
  | 'WordPop'
  | 'SlideIn'
  | 'BlurTitle'
  | 'TrackingReveal'
  | 'ShimmerText'
  | 'LiquidFill'
  | 'FloatCard'
  | 'ChromaticTransition'
  | 'FrostedTransition'
  | 'TextStack'
  | 'ShaderReveal'

/** Templates that replace the video entirely — subtitles must be suppressed */
export const SUBTITLE_SUPPRESS_TEMPLATES: TemplateName[] = ['StatCard', 'MoneyCard']

export interface TemplateProps {
  // shared
  text?:        string
  accentColor?: string
  color?:       string
  fontSize?:    number
  // LabelOverlay
  title?:       string
  subtitle?:    string
  // StatCard
  value?:       string
  category?:    string
  context?:     string
  // MoneyCard
  icon?:        string
  label?:       string
  accent?:      string
  // ImpactTitle
  lineColor?:   string
  // GlitchReveal
  glitchColor?: string
  // WordPop
  popColor?:    string
  staggerDelay?: number
  // SlideIn
  direction?:   'left' | 'right' | 'top' | 'bottom'
  // BlurTitle
  blur?:        number
  // TrackingReveal
  startTracking?: number
  // ShimmerText
  baseColor?:   string
  shineColor?:  string
  // LiquidFill
  fillColor?:   string
  waveSpeed?:   number
  // FloatCard
  body?:        string
  cardPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
}

export interface AnimationEvent {
  id:         string
  template:   TemplateName
  startTime:  number   // seconds
  duration:   number   // seconds
  props:      TemplateProps
}

// ── Template metadata for UI ──────────────────────────────────────────────────

export interface TemplateInfo {
  name:    TemplateName
  label:   string
  icon:    string
  desc:    string
  defaultProps: TemplateProps
}

export const TEMPLATE_CATALOG: TemplateInfo[] = [
  {
    name: 'LabelOverlay',
    label: 'Label Overlay',
    icon: '🏷️',
    desc: 'Título colorido + subtítulo flutuando sobre o vídeo com spring',
    defaultProps: { title: 'SUA CLÍNICA PERDE', subtitle: 'R$ 15 MIL POR MÊS' },
  },
  {
    name: 'StatCard',
    label: 'Stat Card',
    icon: '📊',
    desc: 'Tela completa azul-marinho com número grande e contexto animado',
    defaultProps: { value: '73%', category: 'das clínicas', context: 'perdem leads por falta de resposta rápida' },
  },
  {
    name: 'MoneyCard',
    label: 'Money Card',
    icon: '💰',
    desc: 'Overlay com ícone de moeda, valor em laranja e label em branco',
    defaultProps: { value: 'R$ 13.200', label: 'POR MÊS', accent: 'PERDIDOS' },
  },
  {
    name: 'DarkReveal',
    label: 'Dark Reveal',
    icon: '🎬',
    desc: 'Tela escurece, círculo expande e revela texto cinematicamente',
    defaultProps: { text: 'FRASE DE IMPACTO', accentColor: '#F5813F' },
  },
  {
    name: 'ImpactTitle',
    label: 'Impact Title',
    icon: '💥',
    desc: 'Texto sobe com blur + linha animada embaixo',
    defaultProps: { text: 'AFIRMAÇÃO FORTE', subtitle: '', lineColor: '#F5813F' },
  },
  {
    name: 'GlitchReveal',
    label: 'Glitch Reveal',
    icon: '⚡',
    desc: 'Texto aparece com distorção RGB digital',
    defaultProps: { text: 'MOMENTO DE TENSÃO', glitchColor: '#F5813F' },
  },
  {
    name: 'WordPop',
    label: 'Word Pop',
    icon: '🎯',
    desc: 'Cada palavra explode com mola elástica em sequência',
    defaultProps: { text: 'UMA PALAVRA POR VEZ', popColor: '#F5813F', staggerDelay: 4 },
  },
  {
    name: 'SlideIn',
    label: 'Slide In',
    icon: '➡️',
    desc: 'Texto desliza de uma direção com física de mola',
    defaultProps: { text: 'SLIDE TEXT', direction: 'left', color: '#ffffff' },
  },
  {
    name: 'BlurTitle',
    label: 'Blur Reveal',
    icon: '🌫️',
    desc: 'Texto emerge de um desfoque profundo',
    defaultProps: { text: 'EMERGE DO BLUR', blur: 20, fontSize: 72, color: '#ffffff' },
  },
  {
    name: 'TrackingReveal',
    label: 'Tracking In',
    icon: '🔍',
    desc: 'Letras espalhadas convergem e focam',
    defaultProps: { text: 'LETRAS CONVERGINDO', startTracking: 0.6, color: '#ffffff' },
  },
  {
    name: 'ShimmerText',
    label: 'Shimmer',
    icon: '✨',
    desc: 'Brilho metálico desliza sobre o texto',
    defaultProps: { text: '100% DE RESULTADO', baseColor: '#ffffff', shineColor: '#F5813F' },
  },
  {
    name: 'LiquidFill',
    label: 'Liquid Fill',
    icon: '🌊',
    desc: 'Onda líquida preenche o texto de baixo para cima',
    defaultProps: { text: 'LIQUID', fillColor: '#F5813F', waveSpeed: 1 },
  },
  {
    name: 'FloatCard',
    label: 'Float Card',
    icon: '🃏',
    desc: 'Card flutua com informação de destaque',
    defaultProps: { title: 'DICA', body: 'Conteúdo aqui', cardPosition: 'bottom-right', accentColor: '#F5813F' },
  },
  {
    name: 'ChromaticTransition',
    label: 'Chromatic Wipe',
    icon: '🌈',
    desc: 'Transição sci-fi com split de cores RGB (remocn)',
    defaultProps: { text: 'PRÓXIMO', direction: 'left', accentColor: '#F5813F' },
  },
  {
    name: 'FrostedTransition',
    label: 'Frosted Wipe',
    icon: '🧊',
    desc: 'Transição com vidro fosco deslizando (remocn)',
    defaultProps: { text: 'PRÓXIMO', accentColor: '#F5813F' },
  },
  {
    name: 'TextStack',
    label: 'Text Stack 3D',
    icon: '📐',
    desc: 'Texto com camadas 3D e perspectiva (motionforge)',
    defaultProps: { text: 'IMPACT', accentColor: '#F5813F' },
  },
  {
    name: 'ShaderReveal',
    label: 'Shader Reveal',
    icon: '🌀',
    desc: 'Dissolve orgânico via Perlin noise — efeito cinematográfico (motionforge)',
    defaultProps: { text: 'REVEAL', accentColor: '#F5813F' },
  },
]
