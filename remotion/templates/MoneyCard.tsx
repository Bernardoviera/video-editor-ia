import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

function springAt(
  frame: number,
  fps: number,
  startFrame: number,
  cfg: { damping: number; stiffness: number; mass: number }
) {
  return spring({ frame: Math.max(0, frame - startFrame), fps, config: cfg });
}

export function MoneyCard({
  icon   = "$",
  value  = "R$ 13.200",
  label  = "POR MÊS",
  accent = "PERDIDOS",
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Overlay: sweeps in quickly
  const overlayS = spring({ frame, fps, config: { damping: 20, stiffness: 170, mass: 1 } });
  const overlayOp = interpolate(overlayS, [0, 1], [0, 0.58]);

  // Icon: drops from above — Jakub recipe: translateY + opacity + blur
  const iconS    = springAt(frame, fps, 5,  { damping: 13, stiffness: 115, mass: 1.2 });
  // Value: scale up from 0.85 (not 0.7 — gotcha fix) + materializes
  const valueS   = springAt(frame, fps, 11, { damping: 13, stiffness: 95, mass: 1.3 });
  // Label: slides from left + materializes
  const labelS   = springAt(frame, fps, 17, { damping: 16, stiffness: 118, mass: 1 });
  // Accent: gentle fade-up last
  const accentS  = springAt(frame, fps, 22, { damping: 20, stiffness: 140, mass: 0.9 });

  const iconY    = interpolate(iconS,  [0, 1], [-30, 0]);
  const iconOp   = interpolate(iconS,  [0, 1], [0, 1]);
  const iconBlur = interpolate(iconS,  [0, 1], [12, 0]);

  const valueScale = interpolate(valueS, [0, 1], [0.85, 1]);
  const valueOp    = interpolate(valueS, [0, 1], [0, 1]);
  const valueBlur  = interpolate(valueS, [0, 1], [16, 0]);

  const labelX    = interpolate(labelS, [0, 1], [-40, 0]);
  const labelOp   = interpolate(labelS, [0, 1], [0, 1]);
  const labelBlur = interpolate(labelS, [0, 1], [8, 0]);

  const accentY    = interpolate(accentS, [0, 1], [10, 0]);
  const accentOp   = interpolate(accentS, [0, 1], [0, 1]);
  const accentBlur = interpolate(accentS, [0, 1], [6, 0]);

  // Exit: subtler than enter (Jakub) — fade-up + light blur, not full translate
  const exit = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitOp   = 1 - exit;
  const exitY    = interpolate(exit, [0, 1], [0, -12]);
  const exitBlur = interpolate(exit, [0, 1], [0, 8]);

  return (
    <AbsoluteFill>
      {/* Dark overlay */}
      <AbsoluteFill
        style={{ background: `rgba(0,0,0,${overlayOp * exitOp})` }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          opacity: exitOp,
          transform: `translateY(${exitY}px)`,
          filter: exitBlur > 0.5 ? `blur(${exitBlur}px)` : undefined,
        }}
      >
        {/* Coin icon — drops from above + materializes */}
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "#F5813F",
            border: "2px solid #FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 24,
            color: "#FFFFFF",
            boxShadow: "0 0 22px rgba(245,129,63,0.6)",
            transform: `translateY(${iconY}px)`,
            opacity: iconOp,
            filter: `blur(${iconBlur}px)`,
          }}
        >
          {icon}
        </div>

        {/* Value — scales up from 0.85 + materializes */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "#F5813F",
            textAlign: "center",
            textShadow: "0 4px 30px rgba(245,129,63,0.5)",
            lineHeight: 1,
            transform: `scale(${valueScale})`,
            opacity: valueOp,
            filter: `blur(${valueBlur}px)`,
          }}
        >
          {value}
        </div>

        {/* Label — slides from left + materializes */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 52,
            color: "#FFFFFF",
            textAlign: "center",
            textShadow: "0 2px 16px rgba(0,0,0,0.9)",
            lineHeight: 1,
            transform: `translateX(${labelX}px)`,
            opacity: labelOp,
            filter: `blur(${labelBlur}px)`,
          }}
        >
          {label}
        </div>

        {/* Accent — gentle fade-up */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "#F5813F",
            textAlign: "center",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            transform: `translateY(${accentY}px)`,
            opacity: accentOp,
            filter: `blur(${accentBlur}px)`,
          }}
        >
          {accent}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
