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
  weights: ["700", "800"],
  subsets: ["latin"],
});

// ─── Configurações de spring estilo Remotion oficial ──────────────────────────
// damping alto = sem bounce, movimento limpo de vídeo profissional
const SPR_TITLE = { damping: 120, stiffness: 200, mass: 1 };
const SPR_SUB   = { damping: 100, stiffness: 160, mass: 1 };
const SPR_ICON  = { damping: 200, stiffness: 300, mass: 0.8 };

// ─── Componentes ──────────────────────────────────────────────────────────────

function TitleWord({ word, color = "#E53E3E" }: { word: string; color?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: SPR_TITLE, durationInFrames: 20 });

  const y       = interpolate(s, [0, 1], [52, 0],  { extrapolateRight: "clamp" });
  const opacity = interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <span
      style={{
        display: "inline-block",
        transform: `translateY(${y}px)`,
        opacity,
        color,
        fontFamily,
        fontWeight: 800,
        fontSize: 42,
        letterSpacing: "3px",
        textTransform: "uppercase",
        marginRight: "0.25em",
        lineHeight: 1.2,
        willChange: "transform, opacity",
      }}
    >
      {word}
    </span>
  );
}

function SubtitleWord({
  word,
  color = "#FFFFFF",
}: {
  word: string;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: SPR_SUB, durationInFrames: 22 });

  const y       = interpolate(s, [0, 1], [36, 0],  { extrapolateRight: "clamp" });
  const opacity = interpolate(s, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });
  const blur    = interpolate(s, [0, 0.4], [6, 0],  { extrapolateRight: "clamp" });

  return (
    <span
      style={{
        display: "inline-block",
        transform: `translateY(${y}px)`,
        opacity,
        filter: `blur(${blur}px)`,
        color,
        fontFamily,
        fontWeight: 800,
        fontSize: 56,
        lineHeight: 1.2,
        marginRight: "0.22em",
        willChange: "transform, opacity, filter",
      }}
    >
      {word}
    </span>
  );
}

function Spark({ index }: { index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: SPR_ICON, durationInFrames: 12 });

  // pulso contínuo sutil após entrada
  const pulse   = interpolate(Math.sin((frame / fps) * Math.PI * 2.4), [-1, 1], [0.9, 1.0]);
  const scale   = interpolate(s, [0, 1], [0, 1], { extrapolateRight: "clamp" }) * pulse;
  const opacity = interpolate(s, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 18,
        color: "#E53E3E",
        transform: `scale(${scale})`,
        opacity,
        marginRight: index < 2 ? 10 : 0,
        willChange: "transform, opacity",
      }}
    >
      ✦
    </span>
  );
}

// ─── Composição principal ─────────────────────────────────────────────────────

const WORD_STAGGER = 4; // frames entre cada palavra/char

export function LabelOverlay({
  title          = "FRASE DE IMPACTO",
  subtitle       = "complemento do que foi dito",
  highlightWords = [],
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleWords    = title.split(" ");
  const subtitleWords = subtitle.split(" ");

  // Ícones: frame 0
  // Título: cada palavra começa em ICON_DUR + i * WORD_STAGGER
  const ICON_DUR  = 8;
  const TITLE_DUR = ICON_DUR + titleWords.length * WORD_STAGGER + 12;

  // ── Saída global ────────────────────────────────────────────────────────────
  const exitProgress = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [0, 1],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const exitOpacity   = 1 - exitProgress;
  const exitTranslate = interpolate(exitProgress, [0, 1], [0, -24]);
  const exitBlur      = interpolate(exitProgress, [0, 1], [0, 10]);

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>

      {/* Vignette cinematográfico */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
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

      {/* Conteúdo — wrapper com saída global */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
          gap: 0,
          opacity: exitOpacity,
          transform: `translateY(${exitTranslate}px)`,
          filter: `blur(${exitBlur}px)`,
        }}
      >

        {/* ── Ícones ✦ ✦ ✦ ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          {[0, 1, 2].map((i) => (
            <Sequence key={i} from={i * 3} layout="none">
              <Spark index={i} />
            </Sequence>
          ))}
        </div>

        {/* ── Título — palavra por palavra ────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-end",
            overflow: "hidden",
            marginBottom: 22,
            maxWidth: "100%",
          }}
        >
          {titleWords.map((word, i) => (
            <Sequence
              key={i}
              from={ICON_DUR + i * WORD_STAGGER}
              layout="none"
            >
              <TitleWord word={word} />
            </Sequence>
          ))}
        </div>

        {/* ── Subtítulo — palavra por palavra ─────────────────────── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-end",
            maxWidth: "100%",
          }}
        >
          {subtitleWords.map((word, i) => (
            <Sequence
              key={i}
              from={TITLE_DUR + i * WORD_STAGGER}
              layout="none"
            >
              <SubtitleWord
                word={word}
                color={
                  (highlightWords ?? []).includes(i) ? "#E53E3E" : "#FFFFFF"
                }
              />
            </Sequence>
          ))}
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
}
