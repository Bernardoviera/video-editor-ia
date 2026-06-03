import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

export function LabelOverlay({
  title    = "SUA CLÍNICA PERDE",
  subtitle = "R$ 15 MIL POR MÊS",
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Overlay dims in first — heavier damping, no overshoot
  const overlayS = spring({ frame, fps, config: { damping: 22, stiffness: 160, mass: 1 } });

  // Title enters frame 0 — Jakub recipe: opacity + translateY + blur
  const titleS = spring({ frame, fps, config: { damping: 14, stiffness: 88, mass: 1.1 } });

  // Subtitle staggered 7 frames behind title
  const subS = spring({
    frame: Math.max(0, frame - 7),
    fps,
    config: { damping: 14, stiffness: 88, mass: 1.1 },
  });

  const titleY    = interpolate(titleS, [0, 1], [44, 0]);
  const titleOp   = interpolate(titleS, [0, 1], [0, 1]);
  const titleBlur = interpolate(titleS, [0, 1], [10, 0]);

  const subY    = interpolate(subS, [0, 1], [44, 0]);
  const subOp   = interpolate(subS, [0, 1], [0, 1]);
  const subBlur = interpolate(subS, [0, 1], [10, 0]);

  // Exit: subtler than enter (Jakub) — slight lift + blur, no full-height translate
  const exit = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitOp   = 1 - exit;
  const exitY    = interpolate(exit, [0, 1], [0, -14]);
  const exitBlur = interpolate(exit, [0, 1], [0, 7]);

  const overlayOp = interpolate(overlayS, [0, 1], [0, 0.38]) * exitOp;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(0,0,0,${overlayOp})` }} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 220,
          gap: 8,
        }}
      >
        {/* Title — enters first */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 32,
            color: "#E5533A",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: "0.04em",
            lineHeight: 1.15,
            padding: "0 40px",
            textShadow: "0 2px 16px rgba(0,0,0,0.85)",
            opacity: titleOp * exitOp,
            transform: `translateY(${titleY + exitY}px)`,
            filter: `blur(${titleBlur + exitBlur}px)`,
          }}
        >
          {title}
        </div>

        {/* Subtitle — staggered behind */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 42,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.15,
            padding: "0 40px",
            textShadow: "0 2px 20px rgba(0,0,0,0.9)",
            opacity: subOp * exitOp,
            transform: `translateY(${subY + exitY}px)`,
            filter: `blur(${subBlur + exitBlur}px)`,
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
