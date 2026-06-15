import React from "react";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";
import { fitFontSize, perWordSlot, seededChar, splitWords } from "./wordStream";

// Porta do caption-matrix-decode (HyperFrames).
// Cada palavra surge embaralhada e "decodifica" para o texto real.
const { fontFamily } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

const GREEN  = "#00FF41";
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
const SCRAMBLE_FRAMES = 6; // duração do embaralhamento antes de revelar

function DecodeWord({
  word,
  slotFrames,
  fontSize,
  color,
}: {
  word: string;
  slotFrames: number;
  fontSize: number;
  color: string;
}) {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  const exit    = interpolate(frame, [slotFrames - 4, slotFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const revealed = frame >= SCRAMBLE_FRAMES;
  // troca o char de scramble a cada 2 frames (evita tremor excessivo)
  const scrambleSeed = Math.floor(frame / 2);
  const display = revealed
    ? word
    : word
        .split("")
        .map((c, i) => (c === " " ? " " : seededChar(scrambleSeed * 31 + i * 7, CHARSET)))
        .join("");

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily,
          fontWeight: 700,
          fontSize,
          lineHeight: 1,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color,
          textShadow: `0 0 18px ${GREEN}55`,
          opacity: opacity * exit,
          willChange: "opacity",
        }}
      >
        {display}
      </div>
    </AbsoluteFill>
  );
}

export function MatrixDecode({
  title          = "",
  subtitle       = "",
  highlightWords = [],
  accentColor    = "#FFFFFF",
}: TemplateProps) {
  const { durationInFrames, width } = useVideoConfig();

  const words    = splitWords(title, subtitle);
  const slot     = perWordSlot(words.length, durationInFrames);
  const baseSize = Math.round(width * 0.09);
  const highlightSet = new Set(highlightWords ?? []);

  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      {words.map((word, i) => {
        const fontSize = fitFontSize(word, width * 0.88, baseSize, 0.6);
        const color = highlightSet.has(i) ? (accentColor ?? "#FFFFFF") : GREEN;
        return (
          <Sequence key={i} from={i * slot} durationInFrames={slot} layout="none">
            <DecodeWord
              word={word.toUpperCase()}
              slotFrames={slot}
              fontSize={fontSize}
              color={color}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
