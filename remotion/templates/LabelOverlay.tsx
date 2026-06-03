import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

export function LabelOverlay({
  title    = "FRASE DE IMPACTO",
  subtitle = "complemento do que foi dito",
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 14, stiffness: 88, mass: 1.1 } });
  const subS   = spring({
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

  const exit = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitOp   = 1 - exit;
  const exitY    = interpolate(exit, [0, 1], [0, -14]);
  const exitBlur = interpolate(exit, [0, 1], [0, 7]);

  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "0 48px",
        }}
      >
        {/* Linha 1 — título, branco */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 36,
            color: "#FFFFFF",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: "0.03em",
            lineHeight: 1.25,
            maxWidth: "100%",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            opacity: titleOp * exitOp,
            transform: `translateY(${titleY + exitY}px)`,
            filter: `blur(${titleBlur + exitBlur}px)`,
          }}
        >
          {title}
        </div>

        {/* Linha 2 — subtítulo, vermelho */}
        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            fontSize: 48,
            color: "#E53E3E",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "100%",
            wordBreak: "break-word",
            overflowWrap: "break-word",
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
