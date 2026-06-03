// Uses: GlitchText (clippkit) + KineticTypography type="glitch" (motionforge)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { GlitchText } from "../components/clippkit/GlitchText";
import { KineticTypography } from "../components/motionforge/KineticTypography";
import type { TemplateProps } from "../../lib/animationTypes";

export function GlitchReveal({ text = "GLITCH", glitchColor = "#F5813F" }: TemplateProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // phase 1: glitch (first 40%) — phase 2: clean kinetic reveal
  const glitchPhaseEnd = Math.floor(durationInFrames * 0.4);
  const isGlitching    = frame < glitchPhaseEnd;

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
      {isGlitching ? (
        <GlitchText
          text={(text ?? "GLITCH").toUpperCase()}
          glitchColor={glitchColor ?? "#00c4f0"}
          fontSize={86}
          fontWeight={900}
        />
      ) : (
        <KineticTypography
          text={(text ?? "GLITCH").toUpperCase()}
          type="glitch"
          durationInFrames={Math.floor(durationInFrames * 0.6)}
          stagger={3}
          fontSize={86}
          fontWeight={900}
          color="#ffffff"
          style={{ justifyContent: "center", letterSpacing: "-1px" }}
        />
      )}
    </AbsoluteFill>
  );
}
