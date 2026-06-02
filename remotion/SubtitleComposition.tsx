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
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";
import { TranscriptionWord } from "../lib/whisper";
import { AnimationOverlay } from "./AnimationOverlay";
import type { AnimationEvent, CaptionStyle } from "../lib/animationTypes";

interface Props {
  videoSrc: string;
  words: TranscriptionWord[];
  events?: AnimationEvent[];
  captionStyle?: CaptionStyle;
}

// ── Per-style visual config ───────────────────────────────────────────────────

const STYLE_CFG = {
  bold: {
    maxFontSize:   54,
    fontFamily:    "Open Sans, sans-serif",
    fontWeight:    900,
    highlight:     "#FFE600",   // yellow
    textColor:     "#FFFFFF",
    textShadow:    "-4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000",
    uppercase:     true,
    combineMs:     800,
  },
  bounce: {
    maxFontSize:   42,
    fontFamily:    "Open Sans, sans-serif",
    fontWeight:    700,
    highlight:     "#E53E3E",   // red
    textColor:     "#FFFFFF",
    textShadow:    "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
    uppercase:     true,
    combineMs:     1200,
  },
  clean: {
    maxFontSize:   30,
    fontFamily:    "Inter, sans-serif",
    fontWeight:    400,
    highlight:     "#00c4f0",   // cyan
    textColor:     "rgba(255,255,255,0.9)",
    textShadow:    "0 2px 10px rgba(0,0,0,0.85)",
    uppercase:     false,
    combineMs:     1800,
  },
} satisfies Record<CaptionStyle, {
  maxFontSize: number; fontFamily: string; fontWeight: number;
  highlight: string; textColor: string; textShadow: string;
  uppercase: boolean; combineMs: number;
}>

function wordsToCaptions(words: TranscriptionWord[]): Caption[] {
  return words.map((w, i) => ({
    text: i === 0 ? w.word : ` ${w.word}`,
    startMs: w.start * 1000,
    endMs: w.end * 1000,
    timestampMs: w.start * 1000,
    confidence: null,
  }));
}

// ── SubtitleOverlay ───────────────────────────────────────────────────────────

function SubtitleOverlay({
  pages,
  videoWidth,
  videoHeight,
  cfg,
}: {
  pages: TikTokPage[];
  videoWidth: number;
  videoHeight: number;
  cfg: typeof STYLE_CFG[CaptionStyle];
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

  // Simple font size: scale to fit roughly 2 lines at videoWidth
  const charsPerLine = Math.max(1, Math.floor((videoWidth - 80) / (cfg.maxFontSize * 0.55)));
  const longestWord  = Math.max(...activePage.tokens.map((t) => t.text.trim().length));
  const fontSize     = Math.min(cfg.maxFontSize, Math.floor((videoWidth - 80) / Math.max(longestWord, 1) / 0.6));
  const effectiveSize = Math.max(16, Math.min(cfg.maxFontSize, fontSize, charsPerLine > 0 ? cfg.maxFontSize : 16));

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
        fontFamily: cfg.fontFamily,
        fontWeight: cfg.fontWeight,
        fontSize: effectiveSize,
        lineHeight: 1.25,
        textShadow: cfg.textShadow,
        letterSpacing: "-0.5px",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {activePage.tokens.map((token, i) => {
        const isActive = i === activeTokenIdx;
        const text     = cfg.uppercase ? token.text.trim().toUpperCase() : token.text.trim();
        return (
          <span
            key={i}
            style={{
              color: isActive ? cfg.highlight : cfg.textColor,
              textDecoration: isActive && !cfg.uppercase ? "underline" : "none",
            }}
          >
            {i === 0 ? text : ` ${text}`}
          </span>
        );
      })}
    </div>
  );
}

// ── Root composition ──────────────────────────────────────────────────────────

export const SubtitleComposition: React.FC<Props> = ({
  videoSrc,
  words,
  events = [],
  captionStyle = "bounce",
}) => {
  const { width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("Loading font"));

  const cfg = STYLE_CFG[captionStyle];

  useEffect(() => {
    // Load Inter for clean style; Open Sans is web-safe enough without loading
    const fontName = captionStyle === "clean" ? "Inter" : "Open Sans";
    const fontSrc  = captionStyle === "clean"
      ? `url(${staticFile("fonts/Inter-Bold.woff2")})`
      : null;

    if (!fontSrc) { continueRender(handle); return; }

    const face = new FontFace(fontName, fontSrc, { weight: "400", style: "normal" });
    face.load()
      .then(() => { document.fonts.add(face); continueRender(handle); })
      .catch((err) => cancelRender(err));
  }, [handle, captionStyle]);

  const pages = useMemo(() => {
    const captions = wordsToCaptions(words);
    const { pages: p } = createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: cfg.combineMs,
    });
    return p;
  }, [words, cfg.combineMs]);

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={videoSrc}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <SubtitleOverlay
        pages={pages}
        videoWidth={width}
        videoHeight={height}
        cfg={cfg}
      />
      {events.length > 0 && (
        <AnimationOverlay events={events} width={width} height={height} />
      )}
    </AbsoluteFill>
  );
};
