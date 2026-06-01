"use client";

import { useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { SubtitleComposition } from "@/remotion/SubtitleComposition";
import { TranscriptionWord } from "@/lib/whisper";
import type { AnimationEvent } from "@/lib/animationTypes";

interface VideoPreviewProps {
  videoFile: File;
  words: TranscriptionWord[];
  duration: number;
  videoDimensions: { width: number; height: number };
  events?: AnimationEvent[];
}

export function VideoPreview({
  videoFile,
  words,
  duration,
  videoDimensions,
  events = [],
}: VideoPreviewProps) {
  const [objectUrl] = useState(() => URL.createObjectURL(videoFile));
  const { width, height } = videoDimensions;

  const fps = 30;
  const durationInFrames = Math.max(Math.ceil(duration * fps) + fps, 30);
  const aspectRatio = `${width}/${height}`;

  const inputProps = useMemo(
    () => ({ videoSrc: objectUrl, words, events }),
    [objectUrl, words, events]
  );

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/8 bg-black">
      <Player
        component={SubtitleComposition}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={width}
        compositionHeight={height}
        style={{ width: "100%", aspectRatio }}
        controls
        inputProps={inputProps}
        autoPlay={false}
        loop={false}
        showVolumeControls
        clickToPlay
      />
    </div>
  );
}
