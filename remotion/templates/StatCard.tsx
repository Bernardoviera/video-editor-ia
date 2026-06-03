import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

function useSpringAt(startFrame: number, frame: number, fps: number) {
  return spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });
}

export function StatCard({
  value    = "73%",
  category = "das clínicas",
  context  = "perdem leads por falta de resposta rápida",
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgOp      = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });
  const numS      = useSpringAt(8,  frame, fps);
  const catS      = useSpringAt(14, frame, fps);
  const lineS     = useSpringAt(18, frame, fps);
  const ctxS      = useSpringAt(22, frame, fps);

  const numX      = interpolate(numS,  [0, 1], [-80, 0]);
  const catOp     = interpolate(catS,  [0, 1], [0, 1]);
  const lineW     = interpolate(lineS, [0, 1], [0, 120]);
  const ctxY      = interpolate(ctxS,  [0, 1], [20, 0]);
  const ctxOp     = interpolate(ctxS,  [0, 1], [0, 1]);

  const fadeOut   = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animate count-up if value is a number (strip non-digit chars)
  const numericMatch = value?.match(/^(\D*)([\d.]+)(\D*)$/)
  let displayValue = value ?? "73%"
  if (numericMatch) {
    const prefix = numericMatch[1]
    const num    = parseFloat(numericMatch[2])
    const suffix = numericMatch[3]
    const counted = interpolate(
      Math.min(frame - 8, 20),
      [0, 20],
      [0, num],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )
    displayValue = `${prefix}${Number.isInteger(num) ? Math.round(counted) : counted.toFixed(1)}${suffix}`
  }

  return (
    <AbsoluteFill style={{ opacity: (1 - fadeOut) * bgOp }}>
      {/* Solid background */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, #0F1B3D 0%, #1A2F6B 100%)",
        }}
      />

      {/* Noise texture via SVG filter */}
      <AbsoluteFill style={{ opacity: 0.08 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </AbsoluteFill>

      {/* Content group — vertically centered */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 90px",
          gap: 0,
        }}
      >
        {/* Number + category on same row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 18,
            transform: `translateX(${numX}px)`,
          }}
        >
          <span
            style={{
              fontFamily: "Open Sans, sans-serif",
              fontWeight: 900,
              fontSize: 140,
              color: "#F5813F",
              lineHeight: 1,
              textShadow: "0 4px 32px rgba(245,129,63,0.4)",
            }}
          >
            {displayValue}
          </span>
          <span
            style={{
              fontFamily: "Open Sans, sans-serif",
              fontWeight: 700,
              fontSize: 48,
              color: "#FFFFFF",
              lineHeight: 1,
              paddingBottom: 14,
              opacity: catOp,
            }}
          >
            {category}
          </span>
        </div>

        {/* Accent line */}
        <div
          style={{
            height: 3,
            width: lineW,
            background: "#F5813F",
            borderRadius: 2,
            marginTop: 16,
            marginBottom: 20,
            boxShadow: "0 0 10px rgba(245,129,63,0.6)",
          }}
        />

        {/* Context text */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 400,
            fontSize: 28,
            color: "#FFFFFF",
            opacity: ctxOp,
            transform: `translateY(${ctxY}px)`,
            maxWidth: 760,
            lineHeight: 1.45,
          }}
        >
          {context}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
