// Source: kapishdima/remocn — tracking-in (exact code)
"use client";

import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface TrackingInProps {
  text: string;
  startTracking?: number;
  startBlur?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  speed?: number;
  className?: string;
}

export function TrackingIn({
  text,
  startTracking = 0.5,
  startBlur = 12,
  fontSize = 96,
  color = "#ffffff",
  fontWeight = 700,
  speed = 1,
  className,
}: TrackingInProps) {
  const frame = useCurrentFrame() * speed;
  const { fps } = useVideoConfig();

  const t = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  const letterSpacing = interpolate(t, [0, 1], [startTracking, -0.03]) + "em";
  const blurAmount    = interpolate(t, [0, 1], [startBlur, 0]);
  const opacity       = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.72)",
        padding: "0 50px",
      }}
    >
      <span
        className={className}
        style={{
          fontSize,
          fontWeight,
          color,
          letterSpacing,
          opacity,
          filter: `blur(${blurAmount}px)`,
          fontFamily: "Open Sans, -apple-system, BlinkMacSystemFont, sans-serif",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          textShadow: "0 4px 20px rgba(0,0,0,0.8)",
        }}
      >
        {text}
      </span>
    </div>
  );
}
