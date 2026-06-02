import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

export function FloatCard({
  title        = 'DICA',
  body         = 'Informação de destaque aqui',
  cardPosition = 'bottom-right',
  accentColor  = '#00c4f0',
}: TemplateProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Slide-in spring
  const slideSpring = spring({ frame, fps, config: { damping: 16, stiffness: 150 } })
  const slideIn = interpolate(slideSpring, [0, 1], [0, 1])

  // Continuous float (sine wave)
  const floatY = Math.sin((frame / fps) * Math.PI * 1.2) * 6

  // Fade-out near end
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  // Position
  const posMap: Record<string, React.CSSProperties> = {
    'top-left':     { top: 80,  left: 40 },
    'top-right':    { top: 80,  right: 40 },
    'bottom-left':  { bottom: 200, left: 40 },
    'bottom-right': { bottom: 200, right: 40 },
    'center':       { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  }

  const pos = posMap[cardPosition ?? 'bottom-right']

  // Slide direction (from off-screen)
  const isRight  = cardPosition?.includes('right')
  const slideOffset = isRight
    ? interpolate(slideIn, [0, 1], [120, 0])
    : interpolate(slideIn, [0, 1], [-120, 0])

  const cardOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ opacity: (1 - fadeOut) * cardOpacity }}>
      <div
        style={{
          position: 'absolute',
          ...pos,
          transform: `translateX(${slideOffset}px) translateY(${floatY}px)`,
          width: 340,
          background: 'rgba(8, 8, 16, 0.88)',
          border: `2px solid ${accentColor}`,
          borderRadius: 20,
          padding: '22px 28px',
          backdropFilter: 'blur(12px)',
          boxShadow: `0 0 40px ${accentColor}44, 0 20px 40px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Accent top bar */}
        <div
          style={{
            height: 3,
            width: 48,
            background: accentColor,
            borderRadius: 2,
            marginBottom: 14,
          }}
        />
        <div
          style={{
            color: accentColor,
            fontSize: 22,
            fontFamily: 'Open Sans, sans-serif',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 30,
            fontFamily: 'Open Sans, sans-serif',
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {body}
        </div>
      </div>
    </AbsoluteFill>
  )
}
