import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { TestStoryboard } from "../test-pipeline/test-pipeline.types";
import { env } from "../../../config/env";
import { probeMediaDurationSeconds } from "../media-probe.service";

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
  const renderDurationInSeconds = input.storyboard.scenes.reduce((sum, scene) => sum + scene.durationInSeconds, 0);
  const renderDurationInFrames = Math.ceil(renderDurationInSeconds * input.storyboard.fps);
  console.log("render_started", JSON.stringify({
    fileName: input.fileName,
    productImage: input.productImage,
    sceneCount: input.storyboard.scenes.length,
    fps: input.storyboard.fps,
    renderDurationInSeconds,
    renderDurationInFrames,
  }));
  const composition = await selectComposition({ serveUrl, id: "ai-video-test", inputProps });
  console.log("remotion_composition_selected", JSON.stringify({
    id: composition.id,
    fps: composition.fps,
    durationInFrames: composition.durationInFrames,
    durationInSeconds: composition.durationInFrames / composition.fps,
    width: composition.width,
    height: composition.height,
  }));
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    audioCodec: "aac",
    outputLocation,
    inputProps,
  });
  const finalDurationInSeconds = await probeMediaDurationSeconds(outputLocation);
  console.log("render_completed", JSON.stringify({ outputLocation, finalDurationInSeconds }));

  return {
    path: outputLocation,
    durationInSeconds: finalDurationInSeconds,
    width: input.storyboard.width,
    height: input.storyboard.height,
    fps: input.storyboard.fps,
  };
}
