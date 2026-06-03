// Uses: FrostedGlassWipe (remocn)
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { FrostedGlassWipe } from "../components/remocn/FrostedGlassWipe";
import type { TemplateProps } from "../../lib/animationTypes";

export function FrostedTransition({ text = "PRÓXIMO", accentColor = "#F5813F" }: TemplateProps) {
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
          textShadow: `0 0 40px ${accentColor ?? "#00c4f0"}66`,
        }}
      >
        {text ?? "PRÓXIMO"}
      </span>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill>
      <FrostedGlassWipe
        from={fromPanel}
        to={<AbsoluteFill style={{ background: "rgba(0,0,0,0)" }} />}
        transitionStart={0}
        transitionDuration={Math.floor(durationInFrames * 0.8)}
        glassBlur={24}
      />
    </AbsoluteFill>
  );
}
