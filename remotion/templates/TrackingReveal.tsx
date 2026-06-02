import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

// Adapted from remocn tracking-in (kapishdima/remocn)
export function TrackingReveal({
  text          = 'LETRAS CONVERGINDO',
  startTracking = 0.6,
  color         = '#ffffff',
}: TemplateProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const s = spring({ frame, fps, config: { damping: 18, stiffness: 90 } })

  const letterSpacing = interpolate(s, [0, 1], [startTracking ?? 0.6, -0.03]) + 'em'
  const blurAmount    = interpolate(s, [0, 1], [12, 0])
  const opacity       = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        opacity: (1 - fadeOut) * opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.70)',
        padding: '0 50px',
      }}
    >
      <span
        style={{
          fontSize:      86,
          fontWeight:    900,
          color:         color ?? '#ffffff',
          fontFamily:    'Open Sans, sans-serif',
          textTransform: 'uppercase',
          letterSpacing,
          filter:        `blur(${blurAmount}px)`,
          whiteSpace:    'nowrap',
          textShadow:    '0 4px 20px rgba(0,0,0,0.8)',
        }}
      >
        {text}
      </span>
    </AbsoluteFill>
  )
}
