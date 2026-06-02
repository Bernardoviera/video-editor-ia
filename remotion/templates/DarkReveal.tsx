// Uses: CardExpansionMask (motionforge) + KineticTypography type="reveal" (motionforge)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CardExpansionMask } from "../components/motionforge/CardExpansionMask";
import { KineticTypography } from "../components/motionforge/KineticTypography";
import type { TemplateProps } from "../../lib/animationTypes";

export function DarkReveal({ text = "IMPACTO", accentColor = "#00c4f0" }: TemplateProps) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const overlayOp = interpolate(frame, [0, 8], [0, 0.82], { extrapolateRight: "clamp" });
  const fadeOut   = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // accent line grows inside the reveal
  const lineWidth = interpolate(frame, [10, 30], [0, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: 1 - fadeOut }}>
      {/* Dark overlay */}
      <AbsoluteFill style={{ background: `rgba(0,0,0,${overlayOp})` }} />

      {/* Circle expand reveal via CardExpansionMask */}
      <CardExpansionMask durationInFrames={Math.floor(durationInFrames * 0.6)} centerX={50} centerY={50}>
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accentColor}14 0%, transparent 65%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 16, padding: "0 60px",
          }}
        >
          {/* KineticTypography type="reveal" */}
          <KineticTypography
            text={(text ?? "IMPACTO").toUpperCase()}
            type="reveal"
            durationInFrames={Math.floor(durationInFrames * 0.5)}
            stagger={2}
            fontSize={82}
            fontWeight={900}
            color="#ffffff"
            style={{
              justifyContent: "center",
              textShadow: `0 0 40px ${accentColor}88, 0 4px 0 rgba(0,0,0,0.8)`,
              letterSpacing: "-1px",
            }}
          />
          {/* Accent line */}
          <div
            style={{
              height: 4, width: lineWidth,
              background: accentColor, borderRadius: 2,
              boxShadow: `0 0 12px ${accentColor}`,
            }}
          />
        </AbsoluteFill>
      </CardExpansionMask>
    </AbsoluteFill>
  );
}
