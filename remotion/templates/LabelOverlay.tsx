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

// Cada char do título entra com scale + opacity + blur (sem scramble)
function TitleChar({
  char,
  frame,
  fps,
  delay,
}: {
  char: string;
  frame: number;
  fps: number;
  delay: number;
}) {
  if (char === " ") return <span style={{ display: "inline-block", width: "0.28em" }} />;

  const s = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.7 },
  });

  const scale = interpolate(s, [0, 1], [0.4, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(s, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blur = interpolate(s, [0, 0.6], [10, 0], {
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
        transformOrigin: "center bottom",
        color: "#E53E3E",
      }}
    >
      {char}
    </span>
  );
}

// Subtítulo: cada palavra entra com blur + translateY suave
function SubWord({
  word,
  frame,
  fps,
  delay,
  color,
}: {
  word: string;
  frame: number;
  fps: number;
  delay: number;
  color: string;
}) {
  const s = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 18, stiffness: 110, mass: 1 },
  });

  const y = interpolate(s, [0, 1], [28, 0], { extrapolateRight: "clamp" });
  const opacity = interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
  const blur = interpolate(s, [0, 0.5], [8, 0], { extrapolateRight: "clamp" });

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `translateY(${y}px)`,
        filter: `blur(${blur}px)`,
        color,
        fontFamily,
        fontWeight: 800,
        fontSize: 54,
        lineHeight: 1.2,
        marginRight: "0.22em",
      }}
    >
      {word}
    </span>
  );
}

// Ícone ✦ que pulsa antes do título
function IconSpark({ frame, fps }: { frame: number; fps: number }) {
  const appear = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.7 },
  });

  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2.2),
    [-1, 1],
    [0.88, 1.0]
  );

  const scale = interpolate(appear, [0, 1], [0, 1], { extrapolateRight: "clamp" }) * pulse;
  const opacity = interpolate(appear, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        fontFamily,
        fontSize: 20,
        color: "#E53E3E",
        opacity,
        transform: `scale(${scale})`,
        marginBottom: 18,
        letterSpacing: "0.5em",
        display: "flex",
        gap: 8,
        justifyContent: "center",
      }}
    >
      <span>✦</span>
      <span style={{ opacity: interpolate(appear, [0.2, 0.8], [0, 1], { extrapolateRight: "clamp" }) }}>✦</span>
      <span style={{ opacity: interpolate(appear, [0.4, 1.0], [0, 1], { extrapolateRight: "clamp" }) }}>✦</span>
    </div>
  );
}

export function LabelOverlay({
  title    = "FRASE DE IMPACTO",
  subtitle = "complemento do que foi dito",
  highlightWords = [],
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleChars = title.toUpperCase().split("");
  const CHAR_STAGGER = 2;
  const TITLE_START = 5;
  const titleEnd = TITLE_START + titleChars.length * CHAR_STAGGER + 10;
  const subtitleWords = subtitle.split(" ");
  const WORD_STAGGER = 5;

  // ── Saída ─────────────────────────────────────────────────────────
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp   = 1 - exit;
  const exitY    = interpolate(exit, [0, 1], [0, -20]);
  const exitBlur = interpolate(exit, [0, 1], [0, 10]);

  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden" }}>

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.80) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Film grain */}
      <AbsoluteFill
        style={{
          opacity: 0.035,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
          pointerEvents: "none",
        }}
      />

      {/* Conteúdo */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 56px",
          opacity: exitOp,
          transform: `translateY(${exitY}px)`,
          filter: `blur(${exitBlur}px)`,
        }}
      >
        {/* Ícone ✦ ✦ ✦ */}
        <IconSpark frame={frame} fps={fps} />

        {/* Título — char por char com scale + blur */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontFamily,
            fontWeight: 800,
            fontSize: 40,
            letterSpacing: "4px",
            textTransform: "uppercase",
            marginBottom: 20,
            maxWidth: "100%",
          }}
        >
          {titleChars.map((char, i) => (
            <TitleChar
              key={i}
              char={char}
              frame={frame}
              fps={fps}
              delay={TITLE_START + i * CHAR_STAGGER}
            />
          ))}
        </div>

        {/* Subtítulo — palavra por palavra com blur */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "100%",
          }}
        >
          {subtitleWords.map((word, i) => (
            <SubWord
              key={i}
              word={word}
              frame={frame}
              fps={fps}
              delay={titleEnd + i * WORD_STAGGER}
              color={(highlightWords ?? []).includes(i) ? "#E53E3E" : "#FFFFFF"}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
