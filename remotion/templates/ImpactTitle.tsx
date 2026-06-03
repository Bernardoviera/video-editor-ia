// Uses: KineticTypography type="velocity" (motionforge)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticTypography } from "../components/motionforge/KineticTypography";
import type { TemplateProps } from "../../lib/animationTypes";

export function ImpactTitle({ text = "AFIRMAÇÃO FORTE", subtitle = "", lineColor = "#F5813F" }: TemplateProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const lineWidth = interpolate(frame, [8, 24], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const subOp = interpolate(frame, [14, 26], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [14, 26], [24, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - fadeOut,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#000000",
        padding: "0 50px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "90%" }}>
        {/* Main title via KineticTypography velocity */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <KineticTypography
            text={(text ?? "AFIRMAÇÃO FORTE").toUpperCase()}
            type="velocity"
            durationInFrames={Math.floor(durationInFrames * 0.55)}
            stagger={2}
            fontSize={62}
            fontWeight={900}
            color="#ffffff"
            style={{
              justifyContent: "center",
              letterSpacing: "-2px",
              lineHeight: "1.05",
              textShadow: "0 4px 20px rgba(0,0,0,0.9)",
            }}
          />
        </div>

        {/* Animated underline */}
        <div
          style={{
            height: 4, width: `${lineWidth}%`,
            background: lineColor ?? "#00c4f0",
            margin: "14px auto",
            borderRadius: 2,
            boxShadow: `0 0 12px ${lineColor ?? "#00c4f0"}88`,
          }}
        />

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              color: "rgba(255,255,255,0.75)", fontSize: 40,
              fontFamily: "Open Sans, sans-serif", fontWeight: 400,
              letterSpacing: "0.02em",
              opacity: subOp, transform: `translateY(${subY}px)`,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
