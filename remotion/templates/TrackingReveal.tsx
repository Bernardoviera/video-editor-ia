// Uses: TrackingIn (remocn)
import React from "react";
import { AbsoluteFill } from "remotion";
import { TrackingIn } from "../components/remocn/TrackingIn";
import type { TemplateProps } from "../../lib/animationTypes";

export function TrackingReveal({ text = "LETRAS CONVERGINDO", startTracking = 0.6, color = "#ffffff" }: TemplateProps) {
  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <TrackingIn
        text={(text ?? "LETRAS CONVERGINDO").toUpperCase()}
        startTracking={startTracking ?? 0.6}
        startBlur={12}
        fontSize={86}
        color={color ?? "#ffffff"}
        fontWeight={900}
      />
    </AbsoluteFill>
  );
}
