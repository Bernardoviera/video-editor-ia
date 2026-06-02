// Clippkit-style GlitchText
// Source not publicly accessible; implemented to match described behaviour
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface GlitchTextProps {
  text: string;
  glitchColor?: string;
  fontSize?: number;
  fontWeight?: string | number;
  color?: string;
  glitchIntensity?: number;
  style?: React.CSSProperties;
}

function pseudoRandom(frame: number, seed: number): number {
  const x = Math.sin(frame * 127.1 + seed * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  glitchColor    = "#00c4f0",
  fontSize       = 86,
  fontWeight     = 900,
  color          = "#ffffff",
  glitchIntensity = 12,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const glitchEnd = Math.floor(durationInFrames * 0.5);
  const intensity = interpolate(frame, [0, glitchEnd], [1, 0], { extrapolateRight: "clamp" });
  const maxOff    = glitchIntensity * intensity;

  const rX = pseudoRandom(frame, 1) * maxOff;
  const gX = pseudoRandom(frame, 3) * maxOff;
  const bX = pseudoRandom(frame, 5) * maxOff;

  const baseOp = interpolate(frame, [0, glitchEnd], [0.3, 1], { extrapolateRight: "clamp" });

  const textStyle: React.CSSProperties = {
    fontSize,
    fontFamily:    "Open Sans, system-ui, sans-serif",
    fontWeight,
    textTransform: "uppercase",
    letterSpacing: "-1px",
    position:      "absolute",
    whiteSpace:    "nowrap",
    userSelect:    "none",
  };

  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      <span style={{ ...textStyle, color: "#ff0040", transform: `translateX(${rX}px)`, mixBlendMode: "screen", opacity: intensity * 0.9 }}>{text}</span>
      <span style={{ ...textStyle, color: glitchColor, transform: `translateX(${gX}px)`, mixBlendMode: "screen", opacity: intensity * 0.9 }}>{text}</span>
      <span style={{ ...textStyle, color: "#8800ff", transform: `translateX(${bX}px)`, mixBlendMode: "screen", opacity: intensity * 0.7 }}>{text}</span>
      <span style={{ ...textStyle, color, opacity: baseOp, position: "relative", textShadow: `0 0 20px ${glitchColor}66` }}>{text}</span>
    </div>
  );
};
