// Source: kapishdima/remocn — frosted-glass-wipe
"use client";

import type { ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface FrostedGlassWipeProps {
  from?: ReactNode;
  to?: ReactNode;
  transitionStart?: number;
  transitionDuration?: number;
  glassBlur?: number;
  speed?: number;
  className?: string;
}

export function FrostedGlassWipe({
  from,
  to,
  transitionStart,
  transitionDuration = 30,
  glassBlur = 24,
  speed = 1,
  className,
}: FrostedGlassWipeProps) {
  const frame = useCurrentFrame() * speed;
  const { durationInFrames } = useVideoConfig();

  const start =
    typeof transitionStart === "number"
      ? transitionStart
      : Math.floor(durationInFrames * 0.4);

  const progress = interpolate(
    frame,
    [start, start + transitionDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.6, 0, 0.2, 1),
    },
  );

  const glassX  = interpolate(progress, [0, 1], [-110, 110]);
  const showB   = progress >= 0.5 ? 1 : 0;

  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: "black" }}
    >
      <div style={{ position: "absolute", inset: 0 }}>{from}</div>
      <div style={{ position: "absolute", inset: 0, opacity: showB }}>{to}</div>
      <div
        style={{
          position: "absolute",
          top: 0, bottom: 0, left: 0,
          width: "100%",
          transform: `translateX(${glassX}%)`,
          backdropFilter: `blur(${glassBlur}px)`,
          WebkitBackdropFilter: `blur(${glassBlur}px)`,
          background: "rgba(255,255,255,0.05)",
          borderLeft: "1px solid rgba(255,255,255,0.2)",
          borderRight: "1px solid rgba(255,255,255,0.2)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
