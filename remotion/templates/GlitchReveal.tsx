import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

function pseudoRandom(frame: number, seed: number): number {
  const x = Math.sin(frame * 127.1 + seed * 311.7) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

export function GlitchReveal({ text = 'GLITCH', glitchColor = '#00c4f0' }: TemplateProps) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Glitch phase: 0 → glitchEnd, settle after
  const glitchEnd = Math.floor(fps * 0.7)
  const isGlitching = frame < glitchEnd
  const intensity = isGlitching
    ? interpolate(frame, [0, glitchEnd], [1, 0], { extrapolateRight: 'clamp' })
    : 0

  const maxOffset = 12 * intensity

  const rX = isGlitching ? pseudoRandom(frame, 1) * maxOffset : 0
  const rY = isGlitching ? pseudoRandom(frame, 2) * (maxOffset * 0.3) : 0
  const gX = isGlitching ? pseudoRandom(frame, 3) * maxOffset : 0
  const gY = isGlitching ? pseudoRandom(frame, 4) * (maxOffset * 0.3) : 0
  const bX = isGlitching ? pseudoRandom(frame, 5) * maxOffset : 0
  const bY = isGlitching ? pseudoRandom(frame, 6) * (maxOffset * 0.3) : 0

  // Base text fades in as glitch settles
  const baseOp = interpolate(frame, [0, glitchEnd], [0.3, 1], { extrapolateRight: 'clamp' })

  // Fade-out near end
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  const textStyle: React.CSSProperties = {
    fontSize: 86,
    fontFamily: 'Open Sans, sans-serif',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '-1px',
    position: 'absolute',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  }

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - fadeOut,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
      }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Red channel */}
        <span
          style={{
            ...textStyle,
            color: '#ff0040',
            transform: `translate(${rX}px, ${rY}px)`,
            mixBlendMode: 'screen',
            opacity: intensity * 0.9,
          }}
        >
          {text}
        </span>
        {/* Cyan channel */}
        <span
          style={{
            ...textStyle,
            color: glitchColor,
            transform: `translate(${gX}px, ${gY}px)`,
            mixBlendMode: 'screen',
            opacity: intensity * 0.9,
          }}
        >
          {text}
        </span>
        {/* Blue channel */}
        <span
          style={{
            ...textStyle,
            color: '#8800ff',
            transform: `translate(${bX}px, ${bY}px)`,
            mixBlendMode: 'screen',
            opacity: intensity * 0.7,
          }}
        >
          {text}
        </span>
        {/* Base white text */}
        <span
          style={{
            ...textStyle,
            color: '#ffffff',
            opacity: baseOp,
            position: 'relative',
            textShadow: `0 0 20px ${glitchColor}66`,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  )
}
