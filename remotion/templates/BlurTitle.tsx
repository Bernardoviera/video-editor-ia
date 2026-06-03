// Uses: BlurReveal (remocn)
import React from "react";
import { AbsoluteFill } from "remotion";
import { BlurReveal } from "../components/remocn/BlurReveal";
import type { TemplateProps } from "../../lib/animationTypes";

export function BlurTitle({ text = "EMERGE DO BLUR", blur = 20, fontSize = 50, color = "#ffffff" }: TemplateProps) {
  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <BlurReveal
        text={(text ?? "EMERGE DO BLUR").toUpperCase()}
        blur={blur ?? 20}
        fontSize={fontSize ?? 72}
        color={color ?? "#ffffff"}
        fontWeight={700}
      />
    </AbsoluteFill>
  );
}
