// Source: kapishdima/remocn — chromatic-aberration-wipe
// Imports updated to use remotion directly (already uses remotion in original)
"use client";

import type { ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface ChromaticAberrationWipeProps {
  from?: ReactNode;
  to?: ReactNode;
  direction?: "left" | "right";
  transitionStart?: number;
  transitionDuration?: number;
  aberrationOffset?: number;
  speed?: number;
  className?: string;
}

export function ChromaticAberrationWipe({
  from,
  to,
  direction = "left",
  transitionStart,
  transitionDuration = 7,
  aberrationOffset = 8,
  speed = 1,
  className,
}: ChromaticAberrationWipeProps) {
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
      easing: Easing.bezier(0.65, 0, 0.35, 1),
    },
  );

  const sign = direction === "left" ? -1 : 1;
  const fromOffset = progress * 100 * sign;
  const toOffset = (1 - progress) * 100 * -sign;
  const transformX = (offset: number) => `translateX(${offset}%)`;

  const peakStart = start + Math.max(1, Math.floor(transitionDuration * 0.25));
  const peakEnd   = start + Math.max(peakStart + 1, Math.ceil(transitionDuration * 0.75));
  const inPeak    = frame >= peakStart && frame <= peakEnd;
  const filter    = inPeak
    ? `drop-shadow(-${aberrationOffset}px 0 0 rgba(255,0,0,0.8)) drop-shadow(${aberrationOffset}px 0 0 rgba(0,255,255,0.8))`
    : "none";

  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", background: "black", filter }}
    >
      <div style={{ position: "absolute", inset: 0, transform: transformX(fromOffset), willChange: "transform" }}>
        {from}
      </div>
      <div style={{ position: "absolute", inset: 0, transform: transformX(toOffset), willChange: "transform" }}>
        {to}
      </div>
    </div>
  );
}
