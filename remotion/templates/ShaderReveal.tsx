// Uses: ShaderImageReveal (motionforge — SVG feTurbulence Perlin dissolve)
import React from "react";
import { AbsoluteFill } from "remotion";
import { ShaderImageReveal } from "../components/motionforge/ShaderImageReveal";
import type { TemplateProps } from "../../lib/animationTypes";

export function ShaderReveal({ text = "REVEAL", accentColor = "#F5813F" }: TemplateProps) {
  return (
    <AbsoluteFill>
      <ShaderImageReveal
        baseFrequency={0.55}
        numOctaves={4}
        seed={12}
        scale={14}
      >
        {/* Dark overlay with text revealed by Perlin dissolve */}
        <AbsoluteFill
          style={{
            background: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#ffffff",
                fontSize: 84,
                fontFamily: "Open Sans, sans-serif",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-1px",
                lineHeight: 1.1,
                textShadow: `0 0 40px ${accentColor ?? "#00c4f0"}88, 0 4px 0 rgba(0,0,0,0.8)`,
              }}
            >
              {text ?? "REVEAL"}
            </div>
            <div
              style={{
                margin: "14px auto 0",
                height: 4,
                width: 120,
                background: accentColor ?? "#00c4f0",
                borderRadius: 2,
                boxShadow: `0 0 12px ${accentColor ?? "#00c4f0"}`,
              }}
            />
          </div>
        </AbsoluteFill>
      </ShaderImageReveal>
    </AbsoluteFill>
  );
}
