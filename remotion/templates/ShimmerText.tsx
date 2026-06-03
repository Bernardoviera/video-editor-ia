// Uses: ShimmerSweep (remocn)
import React from "react";
import { AbsoluteFill } from "remotion";
import { ShimmerSweep } from "../components/remocn/ShimmerSweep";
import type { TemplateProps } from "../../lib/animationTypes";

export function ShimmerText({ text = "100% RESULTADO", baseColor = "#ffffff", shineColor = "#F5813F" }: TemplateProps) {
  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <ShimmerSweep
        text={(text ?? "100% RESULTADO").toUpperCase()}
        baseColor={baseColor ?? "#ffffff"}
        shineColor={shineColor ?? "#FFE600"}
        fontSize={56}
        fontWeight={900}
      />
    </AbsoluteFill>
  );
}
