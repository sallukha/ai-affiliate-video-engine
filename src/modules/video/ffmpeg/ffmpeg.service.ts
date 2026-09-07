import { execFile } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { env } from "../../../config/env";
import type { GenerationAsset, GenerationScene, StoryboardInput } from "../../generation/generation.types";
import type { StorageAdapter } from "../../../providers/storage/local-storage";

const execFileAsync = promisify(execFile);

export async function renderWithFfmpeg(input: { generationId: string; storyboard: StoryboardInput; scenes: GenerationScene[]; storage: StorageAdapter }): Promise<GenerationAsset> {
  const source = input.scenes.flatMap((scene) => scene.assets).find((asset) => asset.kind === "preview" || asset.kind === "video");
  const audio = input.scenes.flatMap((scene) => scene.assets).find((asset) => asset.kind === "audio");
  if (!source) throw new Error("At least one scene image or video is required");
  const outputKey = `generations/${input.generationId}/final.mp4`;
  const outputPath = `${env.storagePath}/${outputKey}`;
  await mkdir(`${env.storagePath}/generations/${input.generationId}`, { recursive: true });
  const duration = Math.max(1, input.storyboard.scenes.reduce((sum, scene) => sum + (scene.durationInSeconds ?? 4), 0));
  const args = ["-y", ...(source.kind === "preview" ? ["-loop", "1"] : []), "-i", source.storageKey, ...(audio ? ["-i", audio.storageKey] : []), "-t", String(duration), "-pix_fmt", "yuv420p", "-movflags", "+faststart", ...(audio ? ["-shortest"] : []), outputPath];
  await execFileAsync(env.ffmpegPath, args);
  return { ...(await input.storage.write(outputKey, await readFile(outputPath), "video/mp4")), kind: "final" };
}
