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

  const iconS   = springAt(frame, fps, 5,  { damping: 13, stiffness: 115, mass: 1.2 });
  const valueS  = springAt(frame, fps, 11, { damping: 13, stiffness: 95,  mass: 1.3 });
  const labelS  = springAt(frame, fps, 17, { damping: 16, stiffness: 118, mass: 1   });
  const accentS = springAt(frame, fps, 22, { damping: 20, stiffness: 140, mass: 0.9 });

  const iconY    = interpolate(iconS,  [0, 1], [-28, 0]);
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

  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const exitOp   = 1 - exit;
  const exitY    = interpolate(exit, [0, 1], [0, -12]);

  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "0 80px",
          opacity: exitOp,
          transform: `translateY(${exitY}px)`,
        }}
      >
        {/* Coin icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#F5813F",
            border: "2px solid #FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 20,
            color: "#FFFFFF",
            boxShadow: "0 0 22px rgba(245,129,63,0.6)",
            transform: `translateY(${iconY}px)`,
            opacity: iconOp,
            filter: `blur(${iconBlur}px)`,
          }}
        >
          {icon}
        </div>

        {/* Value */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 50,
            color: "#F5813F",
            textAlign: "center",
            textShadow: "0 4px 30px rgba(245,129,63,0.5)",
            lineHeight: 1,
            maxWidth: "80%",
            wordBreak: "break-word",
            transform: `scale(${valueScale})`,
            opacity: valueOp,
            filter: `blur(${valueBlur}px)`,
          }}
        >
          {value}
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 36,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1,
            maxWidth: "80%",
            wordBreak: "break-word",
            transform: `translateX(${labelX}px)`,
            opacity: labelOp,
            filter: `blur(${labelBlur}px)`,
          }}
        >
          {label}
        </div>

        {/* Accent */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 700,
            fontSize: 16,
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
