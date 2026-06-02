// Clippkit-style SlidingText
// Source not publicly accessible; implemented to match described behaviour
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface SlidingTextProps {
  text: string;
  direction?: "left" | "right" | "top" | "bottom";
  color?: string;
  fontSize?: number;
  fontWeight?: string | number;
  style?: React.CSSProperties;
}

export const SlidingText: React.FC<SlidingTextProps> = ({
  text,
  direction  = "left",
  color      = "#ffffff",
  fontSize   = 84,
  fontWeight = 900,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s        = spring({ frame, fps, config: { damping: 18, stiffness: 140 } });
  const progress = interpolate(s, [0, 1], [0, 1]);
  const OFFSCREEN = 700;

  let tx = 0, ty = 0;
  if (direction === "left")   tx = interpolate(progress, [0, 1], [-OFFSCREEN, 0]);
  if (direction === "right")  tx = interpolate(progress, [0, 1], [ OFFSCREEN, 0]);
  if (direction === "top")    ty = interpolate(progress, [0, 1], [-OFFSCREEN, 0]);
  if (direction === "bottom") ty = interpolate(progress, [0, 1], [ OFFSCREEN, 0]);

  const opacity = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        transform: `translate(${tx}px, ${ty}px)`,
        opacity,
        textAlign: "center",
        ...style,
      }}
    >
      <span
        style={{
          fontSize,
          fontFamily:    "Open Sans, system-ui, sans-serif",
          fontWeight,
          textTransform: "uppercase",
          color,
          letterSpacing: "-1px",
          textShadow:    "0 4px 20px rgba(0,0,0,0.9)",
        }}
      >
        {text}
      </span>
    </div>
  );
};
