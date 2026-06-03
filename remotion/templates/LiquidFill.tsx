// Uses: LiquidText (motionforge)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LiquidText } from "../components/motionforge/LiquidText";
import type { TemplateProps } from "../../lib/animationTypes";

export function LiquidFill({ text = "LIQUID", fillColor = "#F5813F", waveSpeed = 1 }: TemplateProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - fadeOut,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#111111",
      }}
    >
      <LiquidText
        text={(text ?? "LIQUID").toUpperCase()}
        width={900}
        height={200}
        fillColor={fillColor ?? "#00c4f0"}
        strokeColor={fillColor ?? "#00c4f0"}
        fontSize={180}
        fontWeight="bold"
        speed={(waveSpeed ?? 1) * 0.05}
        amplitude={20}
      />
    </AbsoluteFill>
  );
}
