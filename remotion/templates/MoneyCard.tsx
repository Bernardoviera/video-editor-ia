import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

function useSpringAt(startFrame: number, frame: number, fps: number) {
  return spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 16, stiffness: 130, mass: 1 },
  });
}

export function MoneyCard({
  icon   = "$",
  value  = "R$ 13.200",
  label  = "POR MÊS",
  accent = "PERDIDOS",
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const overlayS = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });
  const iconS    = useSpringAt(6,  frame, fps);
  const valueS   = useSpringAt(12, frame, fps);
  const labelS   = useSpringAt(18, frame, fps);
  const accentS  = useSpringAt(22, frame, fps);

  const overlayOp = interpolate(overlayS, [0, 1], [0, 0.55]);
  const iconY     = interpolate(iconS,  [0, 1], [-20, 0]);
  const iconOp    = interpolate(iconS,  [0, 1], [0, 1]);
  const valueScale = interpolate(valueS, [0, 1], [0.7, 1]);
  const valueOp   = interpolate(valueS, [0, 1], [0, 1]);
  const labelX    = interpolate(labelS, [0, 1], [-40, 0]);
  const labelOp   = interpolate(labelS, [0, 1], [0, 1]);
  const accentOp  = interpolate(accentS, [0, 1], [0, 1]);

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: 1 - fadeOut }}>
      {/* Dark overlay */}
      <AbsoluteFill style={{ background: `rgba(0,0,0,${overlayOp})` }} />

      {/* Content — centered */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {/* Coin icon */}
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
            boxShadow: "0 0 16px rgba(245,129,63,0.5)",
            transform: `translateY(${iconY}px)`,
            opacity: iconOp,
          }}
        >
          {icon}
        </div>

        {/* Value */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "#F5813F",
            textAlign: "center",
            textShadow: "0 4px 24px rgba(245,129,63,0.45)",
            transform: `scale(${valueScale})`,
            opacity: valueOp,
            lineHeight: 1,
          }}
        >
          {value}
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 52,
            color: "#FFFFFF",
            textAlign: "center",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
            transform: `translateX(${labelX}px)`,
            opacity: labelOp,
            lineHeight: 1,
          }}
        >
          {label}
        </div>

        {/* Accent */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "#F5813F",
            textAlign: "center",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: accentOp,
          }}
        >
          {accent}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
