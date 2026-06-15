import React, { useMemo } from "react";
import { loadFont } from "@remotion/google-fonts/Anton";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";

// Anton: fonte display condensada usada no kinetic-slam do HyperFrames.
// Só existe no peso 400.
const { fontFamily } = loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

// ─── KINETIC SLAM ─────────────────────────────────────────────────────────────
// Porta fiel do caption-kinetic-slam (HyperFrames) para o sistema de frames do
// Remotion. Uma palavra gigante por vez, centralizada, com 4 modos de entrada
// alternados (cima / esquerda / direita / zoom), cada um com overshoot.

type SlamMode = 0 | 1 | 2 | 3;

function fitFontSize(word: string, maxWidth: number, base: number): number {
  // Anton é condensada: largura média por caractere ~= 0.46 * fontSize.
  // Heurística determinística (sem canvas) para caber na largura segura.
  const perChar = 0.46;
  const needed = maxWidth / Math.max(1, word.length * perChar);
  return Math.max(Math.floor(base * 0.45), Math.min(base, Math.floor(needed)));
}

function SlamWord({
  word,
  mode,
  slotFrames,
  fontSize,
  color,
}: {
  word: string;
  mode: SlamMode;
  slotFrames: number;
  fontSize: number;
  color: string;
}) {
  const frame = useCurrentFrame(); // local à Sequence (começa em 0)
  const { fps } = useVideoConfig();

  // Entrada com overshoot (equivalente a back.out do GSAP)
  const enter = spring({
    frame,
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.6 },
    durationInFrames: 8,
  });

  // Entrada suave para os modos laterais (equivalente a expo.out)
  const slide = interpolate(frame, [0, 6], [0, 1], {
    easing: Easing.out(Easing.exp),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Saída: fade rápido nos últimos frames do slot
  const exitStart = slotFrames - 4;
  const exit = interpolate(frame, [exitStart, slotFrames - 1], [1, 0], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let transform = "translateY(-50%)";
  switch (mode) {
    case 0: // de cima
      transform = `translateY(calc(-50% + ${interpolate(enter, [0, 1], [-120, 0])}px))`;
      break;
    case 1: // da esquerda
      transform = `translate(${interpolate(slide, [0, 1], [-300, 0])}px, -50%)`;
      break;
    case 2: // da direita
      transform = `translate(${interpolate(slide, [0, 1], [300, 0])}px, -50%)`;
      break;
    case 3: // zoom
      transform = `translateY(-50%) scale(${interpolate(enter, [0, 1], [0.4, 1])})`;
      break;
  }

  const entranceOpacity =
    mode === 1 || mode === 2
      ? interpolate(slide, [0, 0.4], [0, 1], { extrapolateRight: "clamp" })
      : interpolate(enter, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: "50%",
        width: "100%",
        textAlign: "center",
        fontFamily,
        fontWeight: 400,
        fontSize,
        lineHeight: 1,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color,
        transform,
        opacity: entranceOpacity * exit,
        willChange: "transform, opacity",
      }}
    >
      {word}
    </div>
  );
}

export function LabelOverlay({
  title          = "FRASE DE IMPACTO",
  subtitle       = "complemento do que foi dito",
  highlightWords = [],
  accentColor    = "#FFD700",
}: TemplateProps) {
  const { durationInFrames, width } = useVideoConfig();

  // Fluxo único de palavras: título + subtítulo concatenados.
  const words = useMemo(() => {
    return `${title} ${subtitle}`.split(/\s+/).filter(Boolean);
  }, [title, subtitle]);

  // Distribui as palavras igualmente ao longo da duração total.
  const slot = Math.max(6, Math.floor(durationInFrames / Math.max(1, words.length)));
  const safeWidth = width * 0.9;
  const baseSize = Math.round(width * 0.16); // ~220px numa composição 1080/1280

  const accent = accentColor ?? "#FFD700";
  const highlights = new Set(highlightWords ?? []);

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>

      {/* Vignette sutil */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Container central das palavras */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {words.map((word, i) => {
          const fontSize = fitFontSize(word, safeWidth, baseSize);
          const mode = (i % 4) as SlamMode;
          const color = highlights.has(i) ? accent : "#FFFFFF";
          return (
            <Sequence
              key={i}
              from={i * slot}
              durationInFrames={slot}
              layout="none"
            >
              <SlamWord
                word={word.toUpperCase()}
                mode={mode}
                slotFrames={slot}
                fontSize={fontSize}
                color={color}
              />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
