// Uses: FloatingCard (clippkit)
import React from "react";
import { AbsoluteFill } from "remotion";
import { FloatingCard } from "../components/clippkit/FloatingCard";
import type { TemplateProps } from "../../lib/animationTypes";

export function FloatCard({
  title        = "DICA",
  body         = "Informação de destaque aqui",
  cardPosition = "bottom-right",
  accentColor  = "#F5813F",
}: TemplateProps) {
  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <FloatingCard
        title={title ?? "DICA"}
        body={body ?? "Informação de destaque aqui"}
        cardPosition={(cardPosition ?? "bottom-right") as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"}
        accentColor={accentColor ?? "#00c4f0"}
      />
    </AbsoluteFill>
  );
}
