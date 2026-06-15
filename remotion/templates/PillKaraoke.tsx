import React from "react";
import { loadFont } from "@remotion/google-fonts/Poppins";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";
import { chunk, splitWords } from "./wordStream";

// Porta do caption-pill-karaoke (HyperFrames).
// Grupos de palavras numa "pílula"; a palavra atual acende em sincronia.
const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

const INACTIVE = "#A6A6A6";
const ACTIVE   = "#1C1E1D";
const PILL_BG  = "#E7E5E7";
const GROUP_SIZE = 4;

function Pill({
  words,
  slotFrames,
  fontSize,
  accent,
  highlightSet,
  wordOffset,
}: {
  words: string[];
  slotFrames: number;
  fontSize: number;
  accent: string;
  highlightSet: Set<number>;
  wordOffset: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 100, stiffness: 200 }, durationInFrames: 8 });
  const exit  = interpolate(frame, [slotFrames - 5, slotFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale   = interpolate(enter, [0, 1], [0.9, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(enter, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }) * exit;

  const perWord   = slotFrames / words.length;
  const activeIdx = Math.min(words.length - 1, Math.floor(frame / perWord));

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.32em",
          maxWidth: "80%",
          padding: "0.4em 0.7em",
          borderRadius: 9999,
          background: PILL_BG,
          transform: `scale(${scale})`,
          opacity,
          willChange: "transform, opacity",
        }}
      >
        {words.map((word, i) => {
          const isActive    = i <= activeIdx;
          const isHighlight = highlightSet.has(wordOffset + i);
          return (
            <span
              key={i}
              style={{
                fontFamily,
                fontWeight: 700,
                fontSize,
                lineHeight: 1.1,
                color: isHighlight && isActive ? accent : isActive ? ACTIVE : INACTIVE,
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

export function PillKaraoke({
  title          = "",
  subtitle       = "",
  highlightWords = [],
  accentColor    = "#E53E3E",
}: TemplateProps) {
  const { durationInFrames, width } = useVideoConfig();

  const words     = splitWords(title, subtitle);
  const groups    = chunk(words, GROUP_SIZE);
  const groupSlot = Math.max(12, Math.floor(durationInFrames / Math.max(1, groups.length)));
  const fontSize  = Math.round(width * 0.05);
  const highlightSet = new Set(highlightWords ?? []);

  let consumed = 0;

  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      {groups.map((g, gi) => {
        const wordOffset = consumed;
        consumed += g.length;
        return (
          <Sequence key={gi} from={gi * groupSlot} durationInFrames={groupSlot} layout="none">
            <Pill
              words={g}
              slotFrames={groupSlot}
              fontSize={fontSize}
              accent={accentColor ?? "#E53E3E"}
              highlightSet={highlightSet}
              wordOffset={wordOffset}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
