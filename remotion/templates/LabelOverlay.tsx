import React from "react";
import { loadFont } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

const { fontFamily } = loadFont("normal", {
  weights: ["700", "800"],
  subsets: ["latin"],
});

// Frames de stagger entre cada palavra
const WORD_STAGGER = 4;
// Frames antes do subtítulo começar (após o título)
const SUB_OFFSET = 10;

function WordZoom({
  word,
  frame,
  fps,
  delay,
  color,
  fontSize,
  letterSpacing,
}: {
  word: string;
  frame: number;
  fps: number;
  delay: number;
  color: string;
  fontSize: number;
  letterSpacing?: string;
}) {
  const f = Math.max(0, frame - delay);

  const s = spring({
    frame: f,
    fps,
    config: { damping: 14, stiffness: 130, mass: 1 },
  });

  // zoom out: começa grande (eixo Z próximo) e chega ao tamanho normal
  const scale = interpolate(s, [0, 1], [1.55, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(s, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blur = interpolate(s, [0, 0.4], [6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        color,
        fontFamily,
        fontWeight: 800,
        fontSize,
        letterSpacing: letterSpacing ?? "0px",
        lineHeight: 1.25,
        marginRight: fontSize * 0.28,
        transformOrigin: "center center",
      }}
    >
      {word}
    </span>
  );
}

export function LabelOverlay({
  title    = "FRASE DE IMPACTO",
  subtitle = "complemento do que foi dito",
  highlightWords = [],
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleWords   = title.split(" ");
  const subtitleWords = subtitle.split(" ");

  // ── Linha divisória: largura 0→100% após último título chegar ───────
  const dividerStart = titleWords.length * WORD_STAGGER + 4;
  const dividerWidth = interpolate(frame, [dividerStart, dividerStart + 13], [0, 100], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Saída: aceleração cúbica ─────────────────────────────────────────
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp   = 1 - exit;
  const exitY    = interpolate(exit, [0, 1], [0, -18]);
  const exitBlur = interpolate(exit, [0, 1], [0, 8]);

  const subBaseDelay = titleWords.length * WORD_STAGGER + dividerStart + SUB_OFFSET;

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

      {/* Film grain overlay */}
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
          padding: "0 48px",
          gap: 0,
          opacity: exitOp,
          transform: `translateY(${exitY}px)`,
          filter: `blur(${exitBlur}px)`,
        }}
      >
        {/* Título — palavras em vermelho, word by word do eixo Z */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 14,
            maxWidth: "100%",
            // compensa o marginRight da última palavra
            marginRight: -38 * 0.28,
          }}
        >
          {titleWords.map((word, i) => (
            <WordZoom
              key={i}
              word={word.toUpperCase()}
              frame={frame}
              fps={fps}
              delay={i * WORD_STAGGER}
              color="#E53E3E"
              fontSize={38}
              letterSpacing="3px"
            />
          ))}
        </div>

        {/* Linha divisória vermelha */}
        <div
          style={{
            height: 3,
            width: `${dividerWidth}%`,
            background: "#E53E3E",
            borderRadius: 2,
            marginBottom: 14,
          }}
        />

        {/* Subtítulo — palavras brancas (destaque vermelho nos índices de highlightWords) */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "100%",
            marginRight: -52 * 0.28,
          }}
        >
          {subtitleWords.map((word, i) => (
            <WordZoom
              key={i}
              word={word}
              frame={frame}
              fps={fps}
              delay={subBaseDelay + i * WORD_STAGGER}
              color={(highlightWords ?? []).includes(i) ? "#E53E3E" : "#FFFFFF"}
              fontSize={52}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
