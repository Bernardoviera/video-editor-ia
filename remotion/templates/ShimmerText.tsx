import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

// Adapted from remocn shimmer-sweep (kapishdima/remocn)
// Shine sweeps from right(200%) to left(-100%) over 80% of duration
export function ShimmerText({
  text       = '100% RESULTADO',
  baseColor  = '#ffffff',
  shineColor = '#FFE600',
}: TemplateProps) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  const sweepEnd = durationInFrames * 0.8
  const shinePos  = interpolate(frame, [0, sweepEnd], [200, -100], { extrapolateRight: 'clamp' })

  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  const textStyle: React.CSSProperties = {
    fontSize:      80,
    fontFamily:    'Open Sans, sans-serif',
    fontWeight:    900,
    textTransform: 'uppercase',
    letterSpacing: '-1px',
    lineHeight:    1.1,
    position:      'absolute',
    left: 0, right: 0,
    textAlign: 'center',
    padding: '0 50px',
  }

  return (
    <AbsoluteFill
      style={{
        opacity: (1 - fadeOut) * opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {/* Base text */}
        <span style={{ ...textStyle, color: baseColor ?? '#ffffff', textShadow: '0 4px 16px rgba(0,0,0,0.7)' }}>
          {text}
        </span>
        {/* Shimmer overlay — gradient clip to text */}
        <span
          style={{
            ...textStyle,
            background: `linear-gradient(90deg, transparent ${shinePos - 15}%, ${shineColor} ${shinePos}%, ${shineColor} ${shinePos + 8}%, transparent ${shinePos + 23}%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip:       'text',
            WebkitTextFillColor:  'transparent',
            color:                 'transparent',
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  )
}
