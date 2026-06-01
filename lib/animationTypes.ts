export type CaptionStyle = 'bold' | 'bounce' | 'clean'
export type AnimationType = 'dark_overlay' | 'text_zoom' | 'emoji_pop' | 'highlight_box' | 'caption_style'
export type Position = 'center' | 'top' | 'bottom'
export type Intensity = 'low' | 'medium' | 'high'

export interface AnimationContent {
  text?: string
  emoji?: string
  color?: string
}

export interface AnimationEvent {
  id: string
  type: AnimationType
  startTime: number
  duration: number
  content: AnimationContent
  position: Position
  intensity: Intensity
}
