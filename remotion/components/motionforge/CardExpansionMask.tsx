// Source: codedbytahir/motionforge — CardExpansionMask
// Adapted: replaced custom context imports with remotion's own hooks
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

interface CardExpansionMaskProps {
  children: React.ReactNode;
  durationInFrames?: number;
  startFrame?: number;
  centerX?: number;
  centerY?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CardExpansionMask: React.FC<CardExpansionMaskProps> = ({
  children,
  durationInFrames = 60,
  startFrame = 0,
  centerX = 50,
  centerY = 50,
  className = "",
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame - startFrame,
    [0, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }
  );

  const radius = progress * 150; // percentage — enough to cover screen diagonal

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        clipPath: `circle(${radius}% at ${centerX}% ${centerY}%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
