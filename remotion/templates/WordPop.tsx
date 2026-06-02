// Uses: PoppingText (clippkit)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PoppingText } from "../components/clippkit/PoppingText";
import type { TemplateProps } from "../../lib/animationTypes";

export function WordPop({
  text         = "UMA PALAVRA POR VEZ",
  popColor     = "#FFE600",
  staggerDelay = 4,
}: TemplateProps) {
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
        background: "rgba(0,0,0,0.72)", padding: "0 50px",
      }}
    >
      <PoppingText
        text={text ?? "UMA PALAVRA POR VEZ"}
        popColor={popColor ?? "#FFE600"}
        staggerDelay={staggerDelay ?? 4}
        fontSize={80}
        fontWeight={900}
      />
    </AbsoluteFill>
  );
}
