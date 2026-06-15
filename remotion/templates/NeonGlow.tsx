import React from "react";
import { loadFont } from "@remotion/google-fonts/Outfit";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";
import { chunk, fitFontSize, splitWords } from "./wordStream";

// Porta do caption-neon-glow (HyperFrames).
// Texto neon ciano; palavra ativa acende com brilho. Destaques em rosa.
const { fontFamily } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });

const CYAN_DIM = "rgba(0, 255, 240, 0.14)";
const CYAN     = "#00FFF0";
const PINK     = "#FF0099";
const GROUP_SIZE = 5;

function glow(color: string): string {
  return `0 0 10px ${color}, 0 0 35px ${color}, 0 0 90px ${color}`;
}

function NeonGroup({
  words,
  slotFrames,
  fontSize,
  highlightSet,
  wordOffset,
}: {
  words: string[];
  slotFrames: number;
  fontSize: number;
  highlightSet: Set<number>;
  wordOffset: number;
}) {
  const frame = useCurrentFrame();

  // desliza para a esquerda na entrada (power3.out ~ exp.out)
  const slideIn = interpolate(frame, [0, 5], [8, 0], { extrapolateRight: "clamp" });
  const enterOp = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const exitOp  = interpolate(frame, [slotFrames - 5, slotFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slideOut = interpolate(frame, [slotFrames - 5, slotFrames - 1], [0, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const perWord   = slotFrames / words.length;
  const activeIdx = Math.min(words.length - 1, Math.floor(frame / perWord));

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.3em",
          maxWidth: "88%",
          transform: `translateX(${slideIn - slideOut}px)`,
          opacity: enterOp * exitOp,
          willChange: "transform, opacity",
        }}
      >
        {words.map((word, i) => {
          const isActive    = i <= activeIdx;
          const isHighlight = highlightSet.has(wordOffset + i);
          const color       = isHighlight ? PINK : CYAN;
          return (
            <span
              key={i}
              style={{
                fontFamily,
                fontWeight: 900,
                fontSize,
                lineHeight: 1,
                textTransform: "uppercase",
                color: isActive ? color : CYAN_DIM,
                textShadow: isActive ? glow(color) : "none",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

export function NeonGlow({
  title          = "",
  subtitle       = "",
  highlightWords = [],
}: TemplateProps) {
  const { durationInFrames, width } = useVideoConfig();

  const words     = splitWords(title, subtitle);
  const groups    = chunk(words, GROUP_SIZE);
  const groupSlot = Math.max(12, Math.floor(durationInFrames / Math.max(1, groups.length)));
  const baseSize  = Math.round(width * 0.07);
  const highlightSet = new Set(highlightWords ?? []);

  let consumed = 0;

  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      {groups.map((g, gi) => {
        const wordOffset = consumed;
        consumed += g.length;
        const fontSize = fitFontSize(g.join(" "), width * 0.88, baseSize, 0.62);
        return (
          <Sequence key={gi} from={gi * groupSlot} durationInFrames={groupSlot} layout="none">
            <NeonGroup
              words={g}
              slotFrames={groupSlot}
              fontSize={fontSize}
              highlightSet={highlightSet}
              wordOffset={wordOffset}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
