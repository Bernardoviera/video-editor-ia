import React from "react";
import { loadFont } from "@remotion/google-fonts/OpenSans";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

// Blocks render until font is ready — prevents fallback-font frames in export
const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "800"],
  subsets: ["latin"],
});

export function LabelOverlay({
  title    = "FRASE DE IMPACTO",
  subtitle = "complemento do que foi dito",
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ── Entrada título ────────────────────────────────────────────────
  const titleS = spring({ frame, fps, config: { damping: 12, stiffness: 120, mass: 1 } });
  const titleY    = interpolate(titleS, [0, 1], [60, 0]);
  // clamp impede blur negativo em overshoot do spring underdamped
  const titleOp   = interpolate(titleS, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleBlur = interpolate(titleS, [0, 1], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Entrada subtítulo (delay 8 frames) ───────────────────────────
  const subS = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 100 } });
  const subY    = interpolate(subS, [0, 1], [60, 0]);
  const subOp   = interpolate(subS, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subBlur = interpolate(subS, [0, 1], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Linha divisória: largura 0% → 100% frames 12-25 ──────────────
  const dividerWidth = interpolate(frame, [12, 25], [0, 100], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Saída: Easing.in para aceleração natural ao sair ─────────────
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp   = 1 - exit;
  const exitY    = interpolate(exit, [0, 1], [0, -18]);
  const exitBlur = interpolate(exit, [0, 1], [0, 8]);

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>

      {/* Vignette cinematográfico */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.72) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Film grain overlay — SVG noise estático, opacity sutil */}
      <AbsoluteFill
        style={{
          opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
          pointerEvents: "none",
        }}
      />

      {/* Conteúdo central */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          padding: "0 48px",
        }}
      >
        {/* Título — vermelho, maiúsculas */}
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 38,
            color: "#E53E3E",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: "3px",
            lineHeight: 1.25,
            maxWidth: "100%",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            marginBottom: 14,
            opacity: titleOp * exitOp,
            transform: `translateY(${titleY + exitY}px)`,
            filter: `blur(${titleBlur + exitBlur}px)`,
          }}
        >
          {title}
        </div>

        {/* Linha divisória vermelha */}
        <div
          style={{
            height: 3,
            width: `${dividerWidth}%`,
            background: "#E53E3E",
            borderRadius: 2,
            marginBottom: 14,
            opacity: exitOp,
            transform: `translateY(${exitY}px)`,
          }}
        />

        {/* Subtítulo — branco, maior */}
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 52,
            color: "#FFFFFF",
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
