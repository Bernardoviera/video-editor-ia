import React from "react";
import { loadFont } from "@remotion/google-fonts/Inter";
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

const { fontFamily } = loadFont("normal", {
  weights: ["300", "700", "800"],
  subsets: ["latin"],
});

// ─── Técnica 1: KINETIC SLAM ──────────────────────────────────────────────────
// Inspirado em caption-kinetic-slam do HyperFrames
// Cada palavra entra com um padrão de entrada diferente, ciclando entre 4 tipos
type SlamType = "top" | "left" | "right" | "scale";

function getSlamType(index: number): SlamType {
  const types: SlamType[] = ["top", "left", "right", "scale"];
  return types[index % 4];
}

function TitleWord({
  word,
  index,
  highlight,
}: {
  word: string;
  index: number;
  highlight: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = getSlamType(index);

  // spring com back.out equivalente — ligeiro overshoot inicial controlado
  const spr = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 280, mass: 0.6 },
    durationInFrames: 18,
  });

  // saída rápida
  const exit = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 200 },
    durationInFrames: 10,
    from: 0,
    to: 1,
  });

  let transformIn = "";
  switch (slam) {
    case "top":
      transformIn = `translateY(${interpolate(spr, [0, 1], [-80, 0], { extrapolateRight: "clamp" })}px)`;
      break;
    case "left":
      transformIn = `translateX(${interpolate(spr, [0, 1], [-60, 0], { extrapolateRight: "clamp" })}px)`;
      break;
    case "right":
      transformIn = `translateX(${interpolate(spr, [0, 1], [60, 0], { extrapolateRight: "clamp" })}px)`;
      break;
    case "scale":
      transformIn = `scale(${interpolate(spr, [0, 1], [0.3, 1], { extrapolateRight: "clamp" })})`;
      break;
  }

  const opacity = interpolate(spr, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });

  return (
    <span
      style={{
        display: "inline-block",
        transform: transformIn,
        opacity,
        color: highlight ? "#E53E3E" : "#FFFFFF",
        fontFamily,
        fontWeight: 800,
        fontSize: 64,
        letterSpacing: "-1px",
        textTransform: "uppercase",
        marginRight: "0.18em",
        lineHeight: 1.1,
        willChange: "transform, opacity",
      }}
    >
      {word}
    </span>
  );
}

// ─── Técnica 2: WEIGHT SHIFT ──────────────────────────────────────────────────
// Inspirado em caption-weight-shift do HyperFrames
// A primeira linha começa bold e vai ficando light conforme a segunda linha entra
function SubtitleLine({
  words,
  isFirstLine,
  secondLineProgress,
  highlightIndices,
  wordOffset,
}: {
  words: string[];
  isFirstLine: boolean;
  secondLineProgress: number;
  highlightIndices: number[];
  wordOffset: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lineIn = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 180 },
    durationInFrames: 20,
  });

  const y       = interpolate(lineIn, [0, 1], [40, 0],  { extrapolateRight: "clamp" });
  const opacity = interpolate(lineIn, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  // weight shift: primeira linha vai de 800→300 conforme segunda entra
  const fontWeight = isFirstLine
    ? Math.round(interpolate(secondLineProgress, [0, 1], [800, 300], { extrapolateRight: "clamp" }))
    : 800;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        transform: `translateY(${y}px)`,
        opacity,
        willChange: "transform, opacity",
      }}
    >
      {words.map((word, i) => {
        const globalIdx = wordOffset + i;
        const isHighlight = highlightIndices.includes(globalIdx);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily,
              fontWeight,
              fontSize: 56,
              lineHeight: 1.2,
              color: isHighlight ? "#E53E3E" : "#FFFFFF",
              marginRight: "0.22em",
              transition: "none",
              willChange: "font-weight",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

// ─── Técnica 3: MORPH EXIT ────────────────────────────────────────────────────
// Inspirado em morph-text do HyperFrames
// Saída com blur crescente + opacity caindo — efeito "dissolve morph"

// ─── Composição principal ─────────────────────────────────────────────────────

const WORD_STAGGER  = 5;   // frames entre palavras do título
const TITLE_START   = 4;   // frame em que o título começa

export function LabelOverlay({
  title          = "FRASE DE IMPACTO",
  subtitle       = "complemento do que foi dito",
  highlightWords = [],
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleWords    = title.split(" ");
  const subtitleWords = subtitle.split(" ");

  // Divide subtítulo em duas linhas (metade cada)
  const midpoint     = Math.ceil(subtitleWords.length / 2);
  const line1        = subtitleWords.slice(0, midpoint);
  const line2        = subtitleWords.slice(midpoint);

  const titleEnd     = TITLE_START + titleWords.length * WORD_STAGGER + 8;
  const line2Start   = titleEnd + 18; // quando linha 2 começa

  // progresso da entrada da linha 2 (para o weight shift da linha 1)
  const line2Progress = spring({
    frame: Math.max(0, frame - line2Start),
    fps,
    config: { damping: 100, stiffness: 180 },
    durationInFrames: 20,
  });

  // ── Saída morph: blur + opacity (técnica morph-text HyperFrames) ────────────
  const exitStart = durationInFrames - 14;
  const exitProg  = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    easing: Easing.bezier(0.4, 0, 1, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity   = 1 - exitProg;
  const exitBlur      = interpolate(exitProg, [0, 1], [0, 18], { extrapolateRight: "clamp" });
  const exitScale     = interpolate(exitProg, [0, 1], [1, 1.06], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Film grain */}
      <AbsoluteFill
        style={{
          opacity: 0.03,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
          pointerEvents: "none",
        }}
      />

      {/* Wrapper com saída morph global */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 64px",
          gap: 16,
          opacity: exitOpacity,
          filter: `blur(${exitBlur}px)`,
          transform: `scale(${exitScale})`,
          willChange: "opacity, filter, transform",
        }}
      >

        {/* ── Título: kinetic slam palavra por palavra ─── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "100%",
          }}
        >
          {titleWords.map((word, i) => (
            <Sequence key={i} from={TITLE_START + i * WORD_STAGGER} layout="none">
              <TitleWord
                word={word}
                index={i}
                highlight={(highlightWords ?? []).includes(i)}
              />
            </Sequence>
          ))}
        </div>

        {/* ── Subtítulo linha 1: weight shift ─── */}
        <Sequence from={titleEnd} layout="none">
          <SubtitleLine
            words={line1}
            isFirstLine
            secondLineProgress={line2Progress}
            highlightIndices={highlightWords ?? []}
            wordOffset={0}
          />
        </Sequence>

        {/* ── Subtítulo linha 2: entra depois, bold ─── */}
        {line2.length > 0 && (
          <Sequence from={line2Start} layout="none">
            <SubtitleLine
              words={line2}
              isFirstLine={false}
              secondLineProgress={0}
              highlightIndices={highlightWords ?? []}
              wordOffset={midpoint}
            />
          </Sequence>
        )}

      </AbsoluteFill>
    </AbsoluteFill>
  );
}
