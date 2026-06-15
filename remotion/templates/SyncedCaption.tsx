import React from "react";
import { loadFont } from "@remotion/google-fonts/Inter";
import { fitText } from "@remotion/layout-utils";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CaptionToken, TemplateProps } from "../../lib/animationTypes";
import { splitWords } from "./wordStream";

// Porta do mecanismo de legenda do template-tiktok oficial do Remotion.
// A palavra acende exatamente quando é dita — os tempos vêm dos `tokens`
// (preenchidos no servidor a partir do timestamp por-palavra do Whisper).
const { fontFamily } = loadFont("normal", { weights: ["800"], subsets: ["latin"] });

const DESIRED_FONT_SIZE = 0.11; // fração da largura
const HIGHLIGHT = "#39E508";     // verde estilo TikTok

// Quando não há tokens (ex.: frase de punch do GPT, não transcrição literal),
// distribui as palavras igualmente como fallback — assim o template nunca quebra.
function fallbackTokens(
  title: string | undefined,
  subtitle: string | undefined,
  durationMs: number,
): CaptionToken[] {
  const words = splitWords(title, subtitle);
  if (words.length === 0) return [];
  const per = durationMs / words.length;
  return words.map((text, i) => ({
    text,
    fromMs: i * per,
    toMs: (i + 1) * per,
  }));
}

export function SyncedCaption({
  title,
  subtitle,
  tokens,
  accentColor = HIGHLIGHT,
}: TemplateProps) {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();

  const timeInMs = (frame / fps) * 1000;
  const durationMs = (durationInFrames / fps) * 1000;

  const activeTokens =
    tokens && tokens.length > 0 ? tokens : fallbackTokens(title, subtitle, durationMs);

  const text = activeTokens.map((t) => t.text).join(" ");

  // Entrada com spring de alto damping (sem bounce) — igual ao SubtitlePage oficial.
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 5 });
  const scale = interpolate(enter, [0, 1], [0.8, 1]);
  const ty = interpolate(enter, [0, 1], [50, 0]);

  const fitted = fitText({
    fontFamily,
    text: text || " ",
    withinWidth: width * 0.9,
    textTransform: "uppercase",
  });
  const fontSize = Math.min(Math.round(width * DESIRED_FONT_SIZE), fitted.fontSize);

  const accent = accentColor ?? HIGHLIGHT;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily,
          fontWeight: 800,
          fontSize,
          lineHeight: 1.1,
          textAlign: "center",
          textTransform: "uppercase",
          maxWidth: "90%",
          color: "#FFFFFF",
          WebkitTextStroke: `${Math.round(fontSize * 0.06)}px #000000`,
          paintOrder: "stroke",
          transform: `scale(${scale}) translateY(${ty}px)`,
          willChange: "transform",
        }}
      >
        {activeTokens.map((t, i) => {
          const active = t.fromMs <= timeInMs && t.toMs > timeInMs;
          return (
            <span
              key={i}
              style={{
                display: "inline",
                whiteSpace: "pre",
                color: active ? accent : "#FFFFFF",
              }}
            >
              {i > 0 ? " " : ""}
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
