import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

export function WordPop({
  text         = 'UMA PALAVRA POR VEZ',
  popColor     = '#FFE600',
  staggerDelay = 4,
}: TemplateProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const words = text.trim().split(/\s+/)

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
        background: 'rgba(0,0,0,0.72)',
        padding: '0 50px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0 18px',
          textAlign: 'center',
        }}
      >
        {words.map((word, i) => {
          const delay = i * (staggerDelay ?? 4)
          const localFrame = Math.max(0, frame - delay)
          const s = spring({ frame: localFrame, fps, config: { damping: 10, stiffness: 260, mass: 0.7 } })
          const scale = interpolate(s, [0, 1], [0, 1])
          const opacity = interpolate(localFrame, [0, 4], [0, 1], { extrapolateRight: 'clamp' })

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontSize: 80,
                fontFamily: 'Open Sans, sans-serif',
                fontWeight: 900,
                textTransform: 'uppercase',
                color: i % 2 === 0 ? '#ffffff' : popColor,
                transform: `scale(${scale})`,
                opacity,
                letterSpacing: '-1px',
                textShadow: '0 4px 12px rgba(0,0,0,0.8)',
              }}
            >
              {word}
            </span>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
