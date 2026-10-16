import type {
  GenerateVideoRequest,
  GenerationResult,
  GenerationScene,
  StoryboardInput,
} from "./generation.types";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import { AppError, ErrorCode } from "../../shared/errors";
import { createAudioForScene } from "../../providers/tts/http-tts.provider";
import { createStorage } from "../../providers/storage/local-storage";
import { renderWithFfmpeg } from "../video/ffmpeg/ffmpeg.service";

const jobs = new Map<string, GenerationResult>();
const storage = createStorage(env.storagePath);

function validateStoryboard(storyboard?: StoryboardInput): StoryboardInput {
  if (!storyboard || !Array.isArray(storyboard.scenes) || storyboard.scenes.length === 0) {
    throw new AppError("storyboard.scenes must contain at least one scene", 400, ErrorCode.VALIDATION_ERROR);
  }
  storyboard.scenes.forEach((scene, index) => {
    if (!scene.narration && !scene.text && !scene.imageUrl && !scene.videoUrl) {
      throw new AppError(`scene ${index} must contain media or narration`, 400, ErrorCode.VALIDATION_ERROR);
    }
  });
  return storyboard;
}

function createScenes(storyboard: StoryboardInput): GenerationScene[] {
  return storyboard.scenes.map((scene, index) => ({
    id: scene.id ?? `scene-${index + 1}`,
    order: scene.order ?? index,
    status: "pending",
    durationInSeconds: scene.durationInSeconds ?? 4,
    narration: scene.narration ?? scene.text,
    assets: [],
  }));
}

async function runGeneration(generationId: string, storyboard: StoryboardInput): Promise<void> {
  const job = jobs.get(generationId);
  if (!job || job.status === "cancelled") return;
  job.status = "processing";
  const scenes = job.scenes ?? [];
  try {
    for (let index = 0; index < storyboard.scenes.length; index += 1) {
      if (jobs.get(generationId)?.status === "cancelled") return;
      const scene = scenes[index];
      const source = storyboard.scenes[index];
      scene.status = "processing";
      if (source.narration || source.text) {
        const audio = await createAudioForScene({ generationId, sceneId: scene.id, text: source.narration ?? source.text ?? "", storage });
        if (audio) scene.assets.push(audio);
      }
      const sourceUrl = source.videoUrl ?? source.imageUrl;
      if (sourceUrl) {
        const asset = await storage.importRemote(sourceUrl, `generations/${generationId}/scenes/${scene.id}/source`);
        scene.assets.push({ ...asset, id: randomUUID(), sceneId: scene.id, kind: source.videoUrl ? "video" : "preview" });
      }
      scene.status = "completed";
    }
    const output = await renderWithFfmpeg({ generationId, storyboard, scenes, storage });
    job.assets = scenes.flatMap((scene) => scene.assets).concat(output);
    job.videoPath = output.url;
    job.status = "completed";
    job.message = "Video generation completed";
  } catch (error) {
    job.status = "failed";
    job.message = error instanceof Error ? error.message : "Video generation failed";
    const active = scenes.find((scene) => scene.status === "processing");
    if (active) { active.status = "failed"; active.error = job.message; }
  }
}

export async function generateVideo(
  input: GenerateVideoRequest
): Promise<GenerationResult> {
  const storyboard = validateStoryboard(input.storyboard ?? {
    scenes: [{ narration: input.description, imageUrl: input.imageUrl, durationInSeconds: input.durationInSeconds }],
  });
  const generationId = randomUUID();
  const result: GenerationResult = {
    generationId,
    projectId: input.projectId,
    userId: input.userId,
    status: "pending",
    message: "Generation queued",
    scenes: createScenes(storyboard),
    assets: [],
  };
  jobs.set(generationId, result);
  void runGeneration(generationId, storyboard);
  return result;
}

export function getGeneration(generationId: string): GenerationResult | undefined {
  return jobs.get(generationId);
}

export function cancelGeneration(generationId: string): GenerationResult | undefined {
  const job = jobs.get(generationId);
  if (job && (job.status === "pending" || job.status === "processing")) job.status = "cancelled";
  return job;
}