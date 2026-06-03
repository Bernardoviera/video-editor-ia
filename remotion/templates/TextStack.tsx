// Uses: TextStack3D (motionforge)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TextStack3D } from "../components/motionforge/TextStack3D";
import type { TemplateProps } from "../../lib/animationTypes";

export function TextStack({ text = "IMPACT", accentColor = "#F5813F" }: TemplateProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity: (1 - fadeOut) * opacity,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#111111",
        padding: "0 60px",
      }}
    >
      <TextStack3D
        text={(text ?? "IMPACT").toUpperCase()}
        layers={8}
        depth={5}
        fontSize={120}
        fontWeight="900"
        mainColor="#ffffff"
        layerColor={accentColor ?? "#00c4f0"}
        durationInFrames={Math.floor(durationInFrames * 0.7)}
      />
    </AbsoluteFill>
  );
}
