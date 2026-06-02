import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

export function DarkReveal({ text = 'IMPACTO', accentColor = '#00c4f0' }: TemplateProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // 1. Dark overlay fades in
  const overlayOpacity = interpolate(frame, [0, 8], [0, 0.82], { extrapolateRight: 'clamp' })

  // 2. Circle clip-path expands via spring
  const circleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 100, mass: 1 } })
  const circleRadius = interpolate(circleSpring, [0, 1], [0, 140])

  // 3. Text scale + opacity via spring (delayed)
  const textSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 180 } })
  const textScale   = interpolate(textSpring, [0, 1], [0.75, 1])
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1])

  // 4. Fade out near end
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })
  const globalOpacity = 1 - fadeOut

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      {/* Dark overlay */}
      <AbsoluteFill style={{ background: `rgba(0,0,0,${overlayOpacity})` }} />

      {/* Circle reveal with clip-path */}
      <AbsoluteFill
        style={{
          clipPath: `circle(${circleRadius}% at 50% 50%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Inner glow */}
        <div
          style={{
            position: 'absolute',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          }}
        />

        {/* Text */}
        <div
          style={{
            transform: `scale(${textScale})`,
            opacity: textOpacity,
            textAlign: 'center',
            padding: '0 60px',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              fontSize: 80,
              fontFamily: 'Open Sans, sans-serif',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-1px',
              lineHeight: 1.1,
              textShadow: `0 0 40px ${accentColor}88, 0 4px 0 rgba(0,0,0,0.8)`,
            }}
          >
            {text}
          </div>
          {/* Accent line */}
          <div
            style={{
              margin: '16px auto 0',
              height: 4,
              width: `${interpolate(textSpring, [0, 1], [0, 120])}px`,
              background: accentColor,
              borderRadius: 2,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
