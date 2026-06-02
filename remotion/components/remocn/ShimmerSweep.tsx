// Source: kapishdima/remocn — shimmer-sweep (adapted from description + pattern)
"use client";

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface ShimmerSweepProps {
  text: string;
  baseColor?: string;
  shineColor?: string;
  fontSize?: number;
  fontWeight?: number;
  speed?: number;
  className?: string;
}

export function ShimmerSweep({
  text,
  baseColor  = "#ffffff",
  shineColor = "#FFE600",
  fontSize   = 72,
  fontWeight = 700,
  speed      = 1,
  className,
}: ShimmerSweepProps) {
  const frame = useCurrentFrame() * speed;
  const { durationInFrames } = useVideoConfig();

  // Shine sweeps from 200% to -100% over 80% of duration
  const shinePos = interpolate(frame, [0, durationInFrames * 0.8], [200, -100], {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const textStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    fontFamily: "Open Sans, -apple-system, BlinkMacSystemFont, sans-serif",
    textTransform: "uppercase",
    letterSpacing: "-1px",
    lineHeight: 1.1,
    position: "absolute",
    left: 0, right: 0,
    textAlign: "center",
    padding: "0 50px",
  };

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.72)",
        opacity,
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        {/* Base text */}
        <span style={{ ...textStyle, color: baseColor, textShadow: "0 4px 16px rgba(0,0,0,0.7)" }}>
          {text}
        </span>
        {/* Shimmer overlay */}
        <span
          className={className}
          style={{
            ...textStyle,
            background: `linear-gradient(90deg, transparent ${shinePos - 15}%, ${shineColor} ${shinePos}%, ${shineColor} ${shinePos + 8}%, transparent ${shinePos + 23}%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
