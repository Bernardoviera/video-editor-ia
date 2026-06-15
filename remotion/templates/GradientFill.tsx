import React from "react";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import {
  AbsoluteFill,
  interpolate,
  spring,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TemplateProps } from "../../lib/animationTypes";
import { fitFontSize, perWordSlot, splitWords } from "./wordStream";

// Porta do caption-gradient-fill (HyperFrames).
// Palavra grande com gradiente colorido (estilo Siri) varrendo o texto.
const { fontFamily } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });

const GRADIENT =
  "linear-gradient(90deg, #FE9F1B, #F76E49, #FF2063, #FD56CB, #EF7AFF, #FE9F1B)";

function GradientWord({
  word,
  slotFrames,
  fontSize,
}: {
  word: string;
  slotFrames: number;
  fontSize: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 100, stiffness: 200 }, durationInFrames: 7 });
  const scale = interpolate(enter, [0, 1], [1.04, 1], { extrapolateRight: "clamp" });
  const opIn  = interpolate(enter, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  const exit  = interpolate(frame, [slotFrames - 5, slotFrames - 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // varre o gradiente da direita para a esquerda durante o slot
  const bgPos = interpolate(frame, [0, slotFrames], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          textAlign: "center",
          maxWidth: "90%",
          backgroundImage: GRADIENT,
          backgroundSize: "200% 100%",
          backgroundPosition: `${bgPos}% 50%`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          transform: `scale(${scale})`,
          opacity: opIn * exit,
          willChange: "transform, opacity, background-position",
        }}
      >
        {word}
      </div>
    </AbsoluteFill>
  );
}

export function GradientFill({
  title    = "",
  subtitle = "",
}: TemplateProps) {
  const { durationInFrames, width } = useVideoConfig();

  const words    = splitWords(title, subtitle);
  const slot     = perWordSlot(words.length, durationInFrames);
  const baseSize = Math.round(width * 0.095);

  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      {words.map((word, i) => {
        const fontSize = fitFontSize(word, width * 0.9, baseSize, 0.58);
        return (
          <Sequence key={i} from={i * slot} durationInFrames={slot} layout="none">
            <GradientWord word={word} slotFrames={slot} fontSize={fontSize} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
