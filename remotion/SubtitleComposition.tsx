"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fitTextOnNLines } from "@remotion/layout-utils";
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";
import { TranscriptionWord } from "../lib/whisper";
import { AnimationOverlay } from "./AnimationOverlay";
import type { AnimationEvent } from "../lib/animationTypes";

const FONT_FAMILY = "Inter";
const fontFamily = FONT_FAMILY;

interface Props {
  videoSrc: string;
  words: TranscriptionWord[];
  events?: AnimationEvent[];
}

const HIGHLIGHT = "#E53E3E";
const TEXT_SHADOW =
  "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000";
const MAX_FONT_SIZE = 38;
const MAX_BOX_WIDTH = 1200;

function wordsToCaptions(words: TranscriptionWord[]): Caption[] {
  return words.map((w, i) => ({
    text: i === 0 ? w.word : ` ${w.word}`,
    startMs: w.start * 1000,
    endMs: w.end * 1000,
    timestampMs: w.start * 1000,
    confidence: null,
  }));
}

function SubtitleOverlay({
  pages,
  videoWidth,
  videoHeight,
  fontsLoaded,
}: {
  pages: TikTokPage[];
  videoWidth: number;
  videoHeight: number;
  fontsLoaded: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;

  const activePage =
    pages.find((p) => currentTimeMs >= p.startMs && currentTimeMs < p.startMs + p.durationMs) ?? null;

  if (!activePage) return null;

  const activeTokenIdx = activePage.tokens.findIndex(
    (t) => currentTimeMs >= t.fromMs && currentTimeMs < t.toMs
  );

  let fontSize = MAX_FONT_SIZE;
  if (fontsLoaded) {
    try {
      const result = fitTextOnNLines({
        text: activePage.text.trim(),
        maxLines: 2,
        maxBoxWidth: MAX_BOX_WIDTH,
        fontFamily,
        fontWeight: "700",
        maxFontSize: MAX_FONT_SIZE,
      });
      fontSize = result.fontSize;
    } catch {
      // Font not ready yet
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: Math.round(videoHeight * 0.08),
        left: 0,
        width: videoWidth,
        boxSizing: "border-box",
        paddingLeft: 40,
        paddingRight: 40,
        textAlign: "center",
        fontFamily,
        fontWeight: 700,
        fontSize,
        lineHeight: 1.25,
        textShadow: TEXT_SHADOW,
        letterSpacing: "-0.5px",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {activePage.tokens.map((token, i) => (
        <span key={i} style={{ color: i === activeTokenIdx ? HIGHLIGHT : "#ffffff" }}>
          {token.text}
        </span>
      ))}
    </div>
  );
}

export const SubtitleComposition: React.FC<Props> = ({ videoSrc, words, events = [] }) => {
  const { width, height } = useVideoConfig();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [handle] = useState(() => delayRender("Loading Inter font"));

  useEffect(() => {
    const face = new FontFace(
      FONT_FAMILY,
      `url(${staticFile("fonts/Inter-Bold.woff2")})`,
      { weight: "700", style: "normal" }
    );
    face
      .load()
      .then(() => {
        document.fonts.add(face);
        setFontsLoaded(true);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle]);

  const pages = useMemo(() => {
    const captions = wordsToCaptions(words);
    const { pages: p } = createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: 1500,
    });
    return p;
  }, [words]);

  return (
    <AbsoluteFill>
      <OffthreadVideo src={videoSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <SubtitleOverlay
        pages={pages}
        videoWidth={width}
        videoHeight={height}
        fontsLoaded={fontsLoaded}
      />
      {events.length > 0 && (
        <AnimationOverlay events={events} width={width} height={height} />
      )}
    </AbsoluteFill>
  );
};
