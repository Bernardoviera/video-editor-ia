// Clippkit-style PoppingText
// Source not publicly accessible; implemented to match described behaviour
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface PoppingTextProps {
  text: string;
  popColor?: string;
  staggerDelay?: number;
  fontSize?: number;
  fontWeight?: string | number;
  style?: React.CSSProperties;
}

export const PoppingText: React.FC<PoppingTextProps> = ({
  text,
  popColor     = "#FFE600",
  staggerDelay = 4,
  fontSize     = 80,
  fontWeight   = 900,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words  = text.trim().split(/\s+/);

  return (
    <div
      style={{
        display:        "flex",
        flexWrap:       "wrap",
        justifyContent: "center",
        alignItems:     "center",
        gap:            "0 16px",
        textAlign:      "center",
        ...style,
      }}
    >
      {words.map((word, i) => {
        const delay       = i * (staggerDelay ?? 4);
        const localFrame  = Math.max(0, frame - delay);
        const s           = spring({ frame: localFrame, fps, config: { damping: 10, stiffness: 260, mass: 0.7 } });
        const scale       = interpolate(s, [0, 1], [0, 1]);
        const opacity     = interpolate(localFrame, [0, 4], [0, 1], { extrapolateRight: "clamp" });

        return (
          <span
            key={i}
            style={{
              display:       "inline-block",
              fontSize,
              fontFamily:    "Open Sans, system-ui, sans-serif",
              fontWeight,
              textTransform: "uppercase",
              color:         i % 2 === 0 ? "#ffffff" : popColor,
              transform:     `scale(${scale})`,
              opacity,
              letterSpacing: "-1px",
              textShadow:    "0 4px 12px rgba(0,0,0,0.8)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
