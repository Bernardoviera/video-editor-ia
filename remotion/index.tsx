import React from "react";
import { registerRoot, Composition } from "remotion";
import { SubtitleComposition } from "./SubtitleComposition";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;

const defaultSegments = [
  { id: 0, start: 0, end: 3, text: "Sample subtitle text" },
];

function RemotionRoot() {
  return (
    <Composition
      id="SubtitleVideo"
      component={SubtitleComposition as AnyComponent}
      durationInFrames={150}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{
        videoSrc: "",
        segments: defaultSegments,
      }}
    />
  );
}

registerRoot(RemotionRoot);
