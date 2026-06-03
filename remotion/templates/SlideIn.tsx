// Uses: SlidingText (clippkit)
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SlidingText } from "../components/clippkit/SlidingText";
import type { TemplateProps } from "../../lib/animationTypes";

export function SlideIn({
  text      = "SLIDE TEXT",
  direction = "left",
  color     = "#ffffff",
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
        background: "#000000", overflow: "hidden",
      }}
    >
      <SlidingText
        text={text ?? "SLIDE TEXT"}
        direction={(direction ?? "left") as "left" | "right" | "top" | "bottom"}
        color={color ?? "#ffffff"}
        fontSize={59}
        fontWeight={900}
      />
    </AbsoluteFill>
  );
}
