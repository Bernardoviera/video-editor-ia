import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

export function ImpactTitle({
  text     = 'AFIRMAÇÃO FORTE',
  subtitle = '',
  lineColor = '#00c4f0',
}: TemplateProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Main text: velocity slide up + blur
  const titleSpring = spring({ frame, fps, config: { damping: 16, stiffness: 160 } })
  const titleY      = interpolate(titleSpring, [0, 1], [70, 0])
  const titleBlur   = interpolate(titleSpring, [0, 1], [10, 0])
  const titleOp     = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  // Subtitle: delayed
  const subSpring = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 18, stiffness: 140 } })
  const subY      = interpolate(subSpring, [0, 1], [30, 0])
  const subOp     = interpolate(subSpring, [0, 1], [0, 1])

  // Underline grows
  const lineWidth = interpolate(frame, [8, 22], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Fade-out
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
        padding: '0 50px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '90%' }}>
        {/* Gradient background hint */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)',
          }}
        />

        <div style={{ position: 'relative' }}>
          {/* Main title */}
          <div
            style={{
              color: '#ffffff',
              fontSize: 88,
              fontFamily: 'Open Sans, sans-serif',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-2px',
              lineHeight: 1.05,
              opacity: titleOp,
              transform: `translateY(${titleY}px)`,
              filter: `blur(${titleBlur}px)`,
              textShadow: '0 4px 20px rgba(0,0,0,0.9)',
            }}
          >
            {text}
          </div>

          {/* Animated line */}
          <div
            style={{
              height: 4,
              width: `${lineWidth}%`,
              background: lineColor,
              margin: '14px auto',
              borderRadius: 2,
              boxShadow: `0 0 12px ${lineColor}88`,
            }}
          />

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: 40,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                letterSpacing: '0.02em',
                opacity: subOp,
                transform: `translateY(${subY}px)`,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  )
}
