import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { TestStoryboard } from "../test-pipeline/test-pipeline.types";
import { env } from "../../../config/env";

export interface RenderedVideo {
  path: string;
  durationInSeconds: number;
  width: number;
  height: number;
  fps: number;
}

export async function renderStoryboardVideo(input: {
  storyboard: TestStoryboard;
  audioDataUrls: Record<string, string>;
  productImage?: string;
  fileName: string;
}): Promise<RenderedVideo> {
  const entryPoint = resolve(process.cwd(), "src/modules/video/remotion/index.tsx");
  const outputDirectory = join(process.cwd(), env.storagePath, "output", "videos");
  const outputLocation = join(outputDirectory, input.fileName);
  await mkdir(outputDirectory, { recursive: true });

  const serveUrl = await bundle({ entryPoint, webpackOverride: (config) => config });
  const inputProps = { storyboard: input.storyboard, audioDataUrls: input.audioDataUrls, productImage: input.productImage };
  console.log("render_started", JSON.stringify({ fileName: input.fileName, productImage: input.productImage, sceneCount: input.storyboard.scenes.length }));
  const composition = await selectComposition({ serveUrl, id: "ai-video-test", inputProps });
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    audioCodec: "aac",
    outputLocation,
    inputProps,
  });
  console.log("render_completed", JSON.stringify({ outputLocation }));

  return {
    path: outputLocation,
    durationInSeconds: input.storyboard.scenes.reduce((sum, scene) => sum + scene.durationInSeconds, 0),
    width: input.storyboard.width,
    height: input.storyboard.height,
    fps: input.storyboard.fps,
  };
}
