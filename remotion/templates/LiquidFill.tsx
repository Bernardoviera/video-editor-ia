import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import type { TemplateProps } from '../../lib/animationTypes'

// SVG-based liquid fill — wave animates upward filling text clip path
export function LiquidFill({
  text      = 'LIQUID',
  fillColor = '#00c4f0',
  waveSpeed = 1,
}: TemplateProps) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()

  const speed = waveSpeed ?? 1

  // Fill level: 0% (bottom) → 110% (overflow) over duration
  const fillLevel = interpolate(frame * speed, [0, durationInFrames * 0.85], [110, -10], {
    extrapolateRight: 'clamp',
  })

  // Wave horizontal position cycles
  const waveOffset = (frame * speed * 3) % 200

  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  const uid = 'liquid-clip'

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
      <svg
        width="900"
        height="200"
        viewBox="0 0 900 200"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <clipPath id={uid}>
            <text
              x="450"
              y="160"
              textAnchor="middle"
              fontFamily="Open Sans, sans-serif"
              fontWeight="900"
              fontSize="180"
              style={{ textTransform: 'uppercase' }}
            >
              {text}
            </text>
          </clipPath>
        </defs>

        {/* Ghost outline text */}
        <text
          x="450"
          y="160"
          textAnchor="middle"
          fontFamily="Open Sans, sans-serif"
          fontWeight="900"
          fontSize="180"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          style={{ textTransform: 'uppercase' }}
        >
          {text}
        </text>

        {/* Liquid fill clipped to text */}
        <g clipPath={`url(#${uid})`}>
          {/* Background fill colour */}
          <rect x="0" y={`${fillLevel}%`} width="900" height="200%" fill={fillColor} opacity="0.4" />
          {/* Wave 1 */}
          <path
            d={`M${-200 + waveOffset},${fillLevel * 2} q50,-20 100,0 q50,20 100,0 q50,-20 100,0 q50,20 100,0 q50,-20 100,0 q50,20 100,0 q50,-20 100,0 q50,20 100,0 V200 H${-200 + waveOffset} Z`}
            fill={fillColor}
            opacity="0.85"
            transform={`translate(0, ${fillLevel * 1.8})`}
          />
          {/* Wave 2 (offset) */}
          <path
            d={`M${-100 + waveOffset},${fillLevel * 2} q50,18 100,0 q50,-18 100,0 q50,18 100,0 q50,-18 100,0 q50,18 100,0 q50,-18 100,0 q50,18 100,0 V200 H${-100 + waveOffset} Z`}
            fill={fillColor}
            opacity="0.5"
            transform={`translate(0, ${fillLevel * 1.8 + 8})`}
          />
        </g>
      </svg>
    </AbsoluteFill>
  )
}
