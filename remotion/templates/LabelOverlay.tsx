import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

export function LabelOverlay({
  title    = "SUA CLÍNICA PERDE",
  subtitle = "R$ 15 MIL POR MÊS",
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const s = spring({ frame, fps, config: { damping: 15, stiffness: 100, mass: 1 } });

  const translateY = interpolate(s, [0, 1], [60, 0]);
  const opacity    = interpolate(s, [0, 1], [0, 1]);

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: 1 - fadeOut }}>
      {/* Dim overlay */}
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />

      {/* Text block — center-bottom */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 220,
          gap: 8,
          transform: `translateY(${translateY}px)`,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 32,
            color: "#E5533A",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: "0.04em",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
            lineHeight: 1.15,
            padding: "0 40px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 42,
            color: "#FFFFFF",
            textAlign: "center",
            textShadow: "0 2px 16px rgba(0,0,0,0.9)",
            lineHeight: 1.15,
            padding: "0 40px",
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
