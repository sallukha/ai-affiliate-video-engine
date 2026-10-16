import React from "react";
import { Composition, registerRoot } from "remotion";
import { TestComposition, type TestCompositionProps } from "./TestComposition";
import type { TestStoryboard } from "../test-pipeline/test-pipeline.types";

export const compositionId = "ai-video-test";

export function RemotionRoot() {
  return (
    <Composition<TestCompositionProps>
      id={compositionId}
      component={TestComposition}
      durationInFrames={210}
      fps={30}
      width={720}
      height={1280}
      calculateMetadata={({ props }) => {
        const storyboard = props.storyboard as TestStoryboard;
        return {
          durationInFrames: Math.ceil(storyboard.scenes.reduce((sum, scene) => sum + scene.durationInSeconds, 0) * storyboard.fps),
          fps: storyboard.fps,
          width: storyboard.width,
          height: storyboard.height,
        };
      }}
      defaultProps={{ storyboard: { id: "default", width: 720, height: 1280, fps: 30, scenes: [{ id: "default", order: 0, durationInSeconds: 7, text: "AI video prototype", narration: "AI video prototype" }] } }}
    />
  );
}

registerRoot(RemotionRoot);
