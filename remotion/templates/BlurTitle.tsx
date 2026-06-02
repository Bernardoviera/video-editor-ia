import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

// Adapted from remocn blur-reveal (kapishdima/remocn)
export function BlurTitle({
  text     = 'EMERGE DO BLUR',
  blur     = 20,
  fontSize = 72,
  color    = '#ffffff',
}: TemplateProps) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  // Reveal over 60% of duration (same logic as remocn blur-reveal)
  const revealEnd = durationInFrames * 0.6

  const opacity = interpolate(frame, [0, revealEnd], [0, 1], { extrapolateRight: 'clamp' })
  const blurVal  = interpolate(frame, [0, revealEnd], [blur ?? 20, 0], { extrapolateRight: 'clamp' })

  // Fade-out near end
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - fadeOut,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        padding: '0 50px',
      }}
    >
      <span
        style={{
          opacity,
          filter:      `blur(${blurVal}px)`,
          fontSize:    fontSize ?? 72,
          fontWeight:  700,
          color:       color ?? '#ffffff',
          fontFamily:  'Open Sans, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '-0.04em',
          textAlign:   'center',
          textShadow:  '0 4px 20px rgba(0,0,0,0.8)',
        }}
      >
        {text}
      </span>
    </AbsoluteFill>
  )
}
