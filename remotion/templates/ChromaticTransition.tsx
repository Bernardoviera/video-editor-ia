// Uses: ChromaticAberrationWipe (remocn)
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ChromaticAberrationWipe } from "../components/remocn/ChromaticAberrationWipe";
import type { TemplateProps } from "../../lib/animationTypes";

export function ChromaticTransition({ text = "TRANSIÇÃO", accentColor = "#F5813F", direction = "left" }: TemplateProps) {
  const { durationInFrames } = useVideoConfig();

  const fromPanel = (
    <AbsoluteFill
      style={{
        background: "#000000",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <span
        style={{
          color: "#ffffff", fontSize: 56, fontFamily: "Open Sans, sans-serif",
          fontWeight: 900, textTransform: "uppercase", letterSpacing: "-1px",
          maxWidth: "80%", wordBreak: "break-word", textAlign: "center",
          textShadow: `0 0 40px ${accentColor ?? "#00c4f0"}88`,
        }}
      >
        {text ?? "TRANSIÇÃO"}
      </span>
    </AbsoluteFill>
  );

  const toPanel = (
    <AbsoluteFill style={{ background: "rgba(0,0,0,0)" }} />
  );

  return (
    <AbsoluteFill>
      <ChromaticAberrationWipe
        from={fromPanel}
        to={toPanel}
        direction={(direction ?? "left") as "left" | "right"}
        transitionStart={0}
        transitionDuration={Math.floor(durationInFrames * 0.6)}
        aberrationOffset={10}
      />
    </AbsoluteFill>
  );
}
