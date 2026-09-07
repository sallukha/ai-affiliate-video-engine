import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import type { TestStoryboard } from "../test-pipeline/test-pipeline.types";

export interface TestCompositionProps {
  storyboard: TestStoryboard;
  audioDataUrls?: Record<string, string>;
  productImage?: string;
}

export function TestComposition({ storyboard, audioDataUrls = {}, productImage }: TestCompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scene = storyboard.scenes.find((candidate, index) => {
    const start = storyboard.scenes.slice(0, index).reduce((sum, item) => sum + item.durationInSeconds * fps, 0);
    return frame >= start && frame < start + candidate.durationInSeconds * fps;
  }) ?? storyboard.scenes[storyboard.scenes.length - 1];
  const sceneIndex = storyboard.scenes.findIndex((candidate) => candidate.id === scene.id);
  const sceneStart = storyboard.scenes.slice(0, sceneIndex).reduce((sum, item) => sum + item.durationInSeconds * fps, 0);
  const sceneFrame = frame - sceneStart;
  const opacity = interpolate(sceneFrame, [0, 15, 30], [0, 1, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#111827", color: "#f8fafc", fontFamily: "Georgia, serif" }}>
      {productImage || scene.imageUrl ? <Img src={productImage ?? scene.imageUrl} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} /> : null}
      <AbsoluteFill style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", justifyContent: "flex-end", padding: 64, opacity }}>
        <div style={{ fontSize: 58, lineHeight: 1.08, fontWeight: 700, textShadow: "0 4px 18px rgba(0,0,0,.5)" }}>{scene.text}</div>
        <div style={{ marginTop: 24, fontFamily: "Arial, sans-serif", fontSize: 20, letterSpacing: 3, textTransform: "uppercase" }}>{String(sceneIndex + 1).padStart(2, "0")} / {String(storyboard.scenes.length).padStart(2, "0")}</div>
      </AbsoluteFill>
      {storyboard.scenes.map((candidate, index) => {
        const start = storyboard.scenes.slice(0, index).reduce((sum, item) => sum + item.durationInSeconds * fps, 0);
        const duration = candidate.durationInSeconds * fps;
        return audioDataUrls[candidate.id] ? (
          <Sequence key={candidate.id} from={start} durationInFrames={duration}>
            <Audio src={audioDataUrls[candidate.id]} />
          </Sequence>
        ) : null;
      })}
    </AbsoluteFill>
  );
}
