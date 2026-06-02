import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

export function SlideIn({
  text      = 'SLIDE TEXT',
  direction = 'left',
  color     = '#ffffff',
}: TemplateProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const s = spring({ frame, fps, config: { damping: 18, stiffness: 140 } })
  const progress = interpolate(s, [0, 1], [0, 1])

  const OFFSCREEN = 700

  let tx = 0, ty = 0
  if (direction === 'left')   tx = interpolate(progress, [0, 1], [-OFFSCREEN, 0])
  if (direction === 'right')  tx = interpolate(progress, [0, 1], [ OFFSCREEN, 0])
  if (direction === 'top')    ty = interpolate(progress, [0, 1], [-OFFSCREEN, 0])
  if (direction === 'bottom') ty = interpolate(progress, [0, 1], [ OFFSCREEN, 0])

  const opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' })

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
        background: 'rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: `translate(${tx}px, ${ty}px)`,
          padding: '0 50px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: 84,
            fontFamily: 'Open Sans, sans-serif',
            fontWeight: 900,
            textTransform: 'uppercase',
            color,
            letterSpacing: '-1px',
            textShadow: '0 4px 20px rgba(0,0,0,0.9)',
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  )
}
