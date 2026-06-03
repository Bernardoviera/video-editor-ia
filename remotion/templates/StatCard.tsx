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

export function StatCard({
  value    = "73%",
  category = "das clínicas",
  context  = "perdem leads por falta de resposta rápida",
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgS   = spring({ frame, fps, config: { damping: 24, stiffness: 200, mass: 0.8 } });
  const numS  = springAt(frame, fps, 6,  { damping: 15, stiffness: 95,  mass: 1.4 });
  const catS  = springAt(frame, fps, 14, { damping: 18, stiffness: 120, mass: 1   });
  const lineS = springAt(frame, fps, 18, { damping: 24, stiffness: 220, mass: 0.7 });
  const ctxS  = springAt(frame, fps, 23, { damping: 20, stiffness: 105, mass: 1.1 });

  const numX    = interpolate(numS,  [0, 1], [-65, 0]);
  const numOp   = interpolate(numS,  [0, 1], [0, 1]);
  const numBlur = interpolate(numS,  [0, 1], [14, 0]);
  const catY    = interpolate(catS,  [0, 1], [12, 0]);
  const catOp   = interpolate(catS,  [0, 1], [0, 1]);
  const catBlur = interpolate(catS,  [0, 1], [8, 0]);
  const lineW   = interpolate(lineS, [0, 1], [0, 120]);
  const ctxY    = interpolate(ctxS,  [0, 1], [18, 0]);
  const ctxOp   = interpolate(ctxS,  [0, 1], [0, 1]);
  const ctxBlur = interpolate(ctxS,  [0, 1], [8, 0]);

  const exit    = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const exitOp = 1 - exit;
  const exitY  = interpolate(exit, [0, 1], [0, 14]);

  const numericMatch = value?.match(/^(\D*)([\d.]+)(\D*)$/);
  let displayValue = value ?? "73%";
  if (numericMatch) {
    const prefix  = numericMatch[1];
    const num     = parseFloat(numericMatch[2]);
    const suffix  = numericMatch[3];
    const counted = interpolate(numS, [0, 1], [0, num], { extrapolateRight: "clamp" });
    displayValue  = `${prefix}${Number.isInteger(num) ? Math.round(counted) : counted.toFixed(1)}${suffix}`;
  }

  return (
    <AbsoluteFill
      style={{
        opacity: bgS * exitOp,
        transform: `translateY(${exitY}px)`,
      }}
    >
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, #0F1B3D 0%, #1A2F6B 100%)" }}
      />

      {/* Grain */}
      <AbsoluteFill style={{ opacity: 0.08 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain-sc">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-sc)" />
        </svg>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "0 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", gap: 16 }}>
          <span
            style={{
              fontFamily: "Open Sans, sans-serif",
              fontWeight: 900,
              fontSize: 98,
              color: "#F5813F",
              lineHeight: 1,
              textShadow: "0 4px 44px rgba(245,129,63,0.45)",
              transform: `translateX(${numX}px)`,
              opacity: numOp,
              filter: `blur(${numBlur}px)`,
            }}
          >
            {displayValue}
          </span>
          <span
            style={{
              fontFamily: "Open Sans, sans-serif",
              fontWeight: 700,
              fontSize: 34,
              color: "#FFFFFF",
              lineHeight: 1,
              paddingBottom: 10,
              maxWidth: 380,
              wordBreak: "break-word",
              transform: `translateY(${catY}px)`,
              opacity: catOp,
              filter: `blur(${catBlur}px)`,
            }}
          >
            {category}
          </span>
        </div>

        <div
          style={{
            height: 3,
            width: lineW,
            background: "#F5813F",
            borderRadius: 2,
            marginTop: 14,
            marginBottom: 18,
            boxShadow: "0 0 16px rgba(245,129,63,0.75)",
          }}
        />

        <div
          style={{
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 400,
            fontSize: 20,
            color: "#FFFFFF",
            maxWidth: "80%",
            lineHeight: 1.5,
            wordBreak: "break-word",
            overflowWrap: "break-word",
            transform: `translateY(${ctxY}px)`,
            opacity: ctxOp,
            filter: `blur(${ctxBlur}px)`,
          }}
        >
          {context}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
