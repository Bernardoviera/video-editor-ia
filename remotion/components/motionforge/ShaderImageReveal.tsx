/**
 * ShaderImageReveal — motionforge-inspired
 *
 * Original (codedbytahir/motionforge) uses React Three Fiber + GLSL shaders
 * for a Perlin noise dissolve. @remotion/three / three are not in this project.
 *
 * This implementation achieves the identical visual effect using the browser's
 * native SVG feTurbulence filter (W3C Perlin noise implementation), which is
 * what the GLSL fragment shader was computing manually. Chromium (used by
 * Remotion's renderer) supports SVG filters fully.
 *
 * How it works:
 *   feTurbulence  → fractal Perlin noise field
 *   feColorMatrix → threshold the noise into a binary mask
 *                   A_out = clamp(noise_R × scale + threshold, 0, 1)
 *   feComposite   → apply mask to SourceGraphic (multiply alphas)
 *
 * As `threshold` sweeps from –scale to +scale the mask transitions from
 * fully transparent to fully opaque, creating a smooth Perlin dissolve.
 */
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface ShaderImageRevealProps {
  /** URL of image to reveal (optional — used as background layer if provided) */
  src?: string;
  /** Frames from composition start to begin the reveal */
  startFrame?: number;
  durationInFrames?: number;
  /** Perlin noise frequency — lower = larger blobs, higher = finer grain */
  baseFrequency?: number;
  /** Number of noise octaves (1–6) */
  numOctaves?: number;
  /** Random seed for the noise pattern */
  seed?: number;
  /** Sharpness of the dissolve edge: higher = sharper threshold */
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ShaderImageReveal: React.FC<ShaderImageRevealProps> = ({
  src,
  startFrame      = 0,
  durationInFrames: dur,
  baseFrequency   = 0.65,
  numOctaves      = 4,
  seed            = 8,
  scale           = 15,
  className       = "",
  style,
  children,
}) => {
  const frame               = useCurrentFrame();
  const { durationInFrames: totalFrames } = useVideoConfig();
  const effectDuration      = dur ?? totalFrames;

  // 0 → 1 progress within the reveal window
  const progress = interpolate(
    frame - startFrame,
    [0, effectDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animate threshold from –scale (all transparent) to +scale (all opaque)
  const threshold = interpolate(progress, [0, 1], [-scale, scale]);

  // Unique filter ID so multiple instances don't clash
  const filterId = React.useId().replace(/:/g, "");

  // The feColorMatrix row for alpha:
  //   A_out = R_noise * scale + 0*G + 0*B + 0*A + threshold
  // Remaining RGB rows keep the content colour (identity passthrough).
  const matrixValues = [
    "1 0 0 0 0",       // R out = R in
    "0 1 0 0 0",       // G out = G in
    "0 0 1 0 0",       // B out = B in
    `${scale} 0 0 0 ${threshold}`,  // A out = scale × R_noise + threshold
  ].join("  ");

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      {/* Inline SVG defines the filter — zero visible size */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", overflow: "hidden" }}
        aria-hidden
      >
        <defs>
          <filter
            id={filterId}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            {/* Generate Perlin / fractal noise */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency={baseFrequency}
              numOctaves={numOctaves}
              seed={seed}
              result="noise"
            />
            {/* Threshold noise into alpha mask */}
            <feColorMatrix
              in="noise"
              type="matrix"
              values={matrixValues}
              result="mask"
            />
            {/* Apply mask to source content */}
            <feComposite operator="in" in="SourceGraphic" in2="mask" />
          </filter>
        </defs>
      </svg>

      {/* Optional image background */}
      {src && (
        <img
          src={src}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Content layer — the Perlin dissolve is applied here */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `url(#${filterId})`,
          willChange: "filter",
        }}
      >
        {children}
      </div>
    </div>
  );
};
