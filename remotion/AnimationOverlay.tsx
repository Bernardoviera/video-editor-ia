"use client";

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import type { AnimationEvent, Position } from "../lib/animationTypes";

interface Props {
  events: AnimationEvent[];
  width: number;
  height: number;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function positionStyle(position: Position): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
  };
  if (position === "top") return { ...base, top: "12%" };
  if (position === "bottom") return { ...base, bottom: "22%" };
  return { ...base, top: "50%", transform: "translate(-50%, -50%)" };
}

// ─── DarkOverlay ─────────────────────────────────────────────────────────────

function DarkOverlay({
  event,
  localFrame,
  totalFrames,
  fps,
}: {
  event: AnimationEvent;
  localFrame: number;
  totalFrames: number;
  fps: number;
}) {
  const fadeDur = Math.floor(fps * 0.25);
  const opacity = interpolate(localFrame, [0, fadeDur], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    localFrame,
    [totalFrames - fadeDur, totalFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const alpha = opacity * (1 - fadeOut);

  const scaleSpring = spring({
    frame: localFrame,
    fps,
    config: { mass: 1, damping: 14, stiffness: 200 },
  });
  const scale = 0.82 + scaleSpring * 0.18;

  return (
    <AbsoluteFill
      style={{ background: `rgba(0,0,0,${0.78 * alpha})` }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          textAlign: "center",
          opacity: alpha,
          padding: "0 40px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {event.content.emoji && (
          <div style={{ fontSize: 90, lineHeight: 1, marginBottom: 16 }}>
            {event.content.emoji}
          </div>
        )}
        {event.content.text && (
          <div
            style={{
              color: event.content.color ?? "#ffffff",
              fontSize: 76,
              fontFamily: "Open Sans, sans-serif",
              fontWeight: 900,
              textTransform: "uppercase",
              lineHeight: 1.15,
              textShadow:
                "3px 3px 0 #000,-3px -3px 0 #000,3px -3px 0 #000,-3px 3px 0 #000",
            }}
          >
            {event.content.text}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// ─── TextZoom ─────────────────────────────────────────────────────────────────

function TextZoom({
  event,
  localFrame,
  fps,
}: {
  event: AnimationEvent;
  localFrame: number;
  fps: number;
}) {
  const rawSpring = spring({
    frame: localFrame,
    fps,
    config: { mass: 1, damping: 10, stiffness: 180 },
  });
  // 0.5 → overshoot → 1.0
  const scale = interpolate(rawSpring, [0, 1], [0.5, 1.0]);

  const pos = positionStyle(event.position);

  return (
    <AbsoluteFill>
      <div
        style={{
          ...pos,
          transform:
            event.position === "center"
              ? `translate(-50%, -50%) scale(${scale})`
              : `translateX(-50%) scale(${scale})`,
          transformOrigin: "center center",
          padding: "0 40px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            color: event.content.color ?? "#ffffff",
            fontSize: 100,
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 900,
            textTransform: "uppercase",
            textShadow:
              "4px 4px 0 #000,-4px -4px 0 #000,4px -4px 0 #000,-4px 4px 0 #000",
            lineHeight: 1.1,
          }}
        >
          {event.content.text}
        </span>
      </div>
    </AbsoluteFill>
  );
}

// ─── EmojiPop ─────────────────────────────────────────────────────────────────

function EmojiPop({
  event,
  localFrame,
  totalFrames,
  fps,
}: {
  event: AnimationEvent;
  localFrame: number;
  totalFrames: number;
  fps: number;
}) {
  const bounceSpring = spring({
    frame: localFrame,
    fps,
    config: { mass: 0.8, damping: 8, stiffness: 220 },
  });
  const scale = bounceSpring;

  const fadeDur = Math.floor(fps * 0.2);
  const fadeOut = interpolate(
    localFrame,
    [totalFrames - fadeDur, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const pos = positionStyle(event.position);

  return (
    <AbsoluteFill>
      <div
        style={{
          ...pos,
          transform:
            event.position === "center"
              ? `translate(-50%, -50%) scale(${scale})`
              : `translateX(-50%) scale(${scale})`,
          opacity: fadeOut,
          fontSize: 120,
          lineHeight: 1,
        }}
      >
        {event.content.emoji ?? "🔥"}
      </div>
    </AbsoluteFill>
  );
}

// ─── HighlightBox ─────────────────────────────────────────────────────────────

function HighlightBox({
  event,
  localFrame,
  fps,
}: {
  event: AnimationEvent;
  localFrame: number;
  fps: number;
}) {
  const slideDur = Math.floor(fps * 0.3);
  const slideIn = interpolate(localFrame, [0, slideDur], [-60, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(localFrame, [0, slideDur], [0, 1], {
    extrapolateRight: "clamp",
  });

  const bgColor = event.content.color
    ? `${event.content.color}CC`
    : "rgba(0,196,240,0.80)";

  const posMap: Record<Position, React.CSSProperties> = {
    top: { top: 60, left: 30 },
    bottom: { bottom: 200, left: 30 },
    center: { top: "50%", left: 30 },
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          ...posMap[event.position],
          opacity,
          transform: `translateY(${slideIn}px)`,
          background: bgColor,
          borderRadius: 16,
          padding: "18px 28px",
          maxWidth: "85%",
        }}
      >
        {event.content.emoji && (
          <span style={{ fontSize: 36, marginRight: 10 }}>
            {event.content.emoji}
          </span>
        )}
        <span
          style={{
            color: "#ffffff",
            fontSize: 48,
            fontFamily: "Open Sans, sans-serif",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {event.content.text}
        </span>
      </div>
    </AbsoluteFill>
  );
}

// ─── Root composition ─────────────────────────────────────────────────────────

export const AnimationOverlay: React.FC<Props> = ({ events }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {events.map((event) => {
        const withinRange =
          currentTime >= event.startTime &&
          currentTime < event.startTime + event.duration;
        if (!withinRange) return null;

        const localFrame = Math.round((currentTime - event.startTime) * fps);
        const totalFrames = Math.round(event.duration * fps);

        switch (event.type) {
          case "dark_overlay":
            return (
              <DarkOverlay
                key={event.id}
                event={event}
                localFrame={localFrame}
                totalFrames={totalFrames}
                fps={fps}
              />
            );
          case "text_zoom":
            return (
              <TextZoom
                key={event.id}
                event={event}
                localFrame={localFrame}
                fps={fps}
              />
            );
          case "emoji_pop":
            return (
              <EmojiPop
                key={event.id}
                event={event}
                localFrame={localFrame}
                totalFrames={totalFrames}
                fps={fps}
              />
            );
          case "highlight_box":
            return (
              <HighlightBox
                key={event.id}
                event={event}
                localFrame={localFrame}
                fps={fps}
              />
            );
          default:
            return null;
        }
      })}
    </AbsoluteFill>
  );
};
