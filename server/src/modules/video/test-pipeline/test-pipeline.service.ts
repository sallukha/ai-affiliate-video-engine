import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { generateAffiliateContent } from "../../../providers/llm/gemini.service";
import { synthesizeSarvamSpeech } from "../../../providers/tts/sarvam.service";
import { renderStoryboardVideo } from "../remotion/render.service";
import type { ProductInput, TestPipelineAsset, TestPipelineJob, TestStoryboard } from "./test-pipeline.types";
import { env } from "../../../config/env";
import { probeMediaDurationSeconds } from "../media-probe.service";

const productSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().min(1).optional(),
  benefits: z.array(z.string().min(1)).optional(),
  imageUrl: z.string().trim().min(1).optional(),
  sourceUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

const sceneSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().nonnegative(),
  durationInSeconds: z.number().positive(),
  text: z.string().min(1),
  narration: z.string().min(1),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
});

const storyboardSchema = z.object({
  id: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.number().positive(),
  scenes: z.array(sceneSchema).min(1),
});

const jobs = new Map<string, TestPipelineJob>();

export async function loadSampleStoryboard(): Promise<TestStoryboard> {
  const path = join(process.cwd(), "src/modules/video/test-pipeline/sample-storyboard.json");
  const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
  return storyboardSchema.parse(parsed);
}

export async function loadMockProduct(): Promise<ProductInput> {
  const path = join(process.cwd(), "src/modules/video/test-pipeline/mock-product.json");
  const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
  return productSchema.parse(parsed);
}

function updateJob(jobId: string, update: Partial<TestPipelineJob>): TestPipelineJob {
  const current = jobs.get(jobId);
  if (!current) throw new Error(`Unknown test pipeline job: ${jobId}`);
  const updated = { ...current, ...update };
  jobs.set(jobId, updated);
  return updated;
}

export async function runCompleteTestPipeline(product?: ProductInput, storyboard?: TestStoryboard, jobId = randomUUID()): Promise<TestPipelineJob> {
  const job: TestPipelineJob = {
    jobId,
    status: "processing",
    stage: "validate-storyboard",
    assets: [],
    createdAt: new Date().toISOString(),
  };
  jobs.set(jobId, job);

  try {
    const validatedProduct = productSchema.parse(product ?? await loadMockProduct());
    const validatedStoryboard = storyboardSchema.parse(storyboard ?? await loadSampleStoryboard());
    const productImage = await resolveProductImage(validatedProduct, jobId);
    addAsset(jobId, productImage.asset);
    updateJob(jobId, { stage: "gemini-script" });
    const generated = await generateAffiliateContent({
      productTitle: validatedProduct.title,
      productDescription: validatedProduct.description,
      productBenefits: validatedProduct.benefits,
      storyboardSceneIds: validatedStoryboard.scenes.map((scene) => scene.id),
      targetDurationSeconds: env.targetVideoDurationSeconds,
    });
    const generatedScenes = validatedStoryboard.scenes.map((scene) => {
      const generatedScene = generated.scenes.find((candidate) => candidate.id === scene.id);
      if (!generatedScene) throw new Error(`Gemini did not generate scene ${scene.id}`);
      return { ...scene, text: generatedScene.caption ?? generatedScene.text ?? generatedScene.narration, narration: generatedScene.narration };
    });

    updateJob(jobId, { stage: "sarvam-voice" });
    const audioDataUrls: Record<string, string> = {};
    const sceneAudioDurations: Record<string, number> = {};
    for (const scene of generatedScenes) {
      const audio = await synthesizeSarvamSpeech({ text: scene.narration, sceneId: scene.id });
      audioDataUrls[scene.id] = audio.dataUrl;
      sceneAudioDurations[scene.id] = audio.durationSeconds;
      addAsset(jobId, { kind: "voice", path: audio.path, mimeType: audio.mimeType, size: audio.size });
    }
    const timedStoryboard = applyAudioDurationsToStoryboard({ ...validatedStoryboard, scenes: generatedScenes }, sceneAudioDurations);

    updateJob(jobId, { stage: "remotion-render" });
    const rendered = await renderStoryboardVideo({
      storyboard: timedStoryboard,
      audioDataUrls,
      productImage: productImage.dataUrl,
      fileName: `gemini-sarvam-${jobId}.mp4`,
    });
    const videoStat = await import("node:fs/promises").then(({ stat }) => stat(rendered.path));
    const finalDurationSeconds = await probeMediaDurationSeconds(rendered.path);
    console.log("final_video_verified", JSON.stringify({
      path: rendered.path,
      size: videoStat.size,
      durationSeconds: finalDurationSeconds,
      targetDurationSeconds: env.targetVideoDurationSeconds,
      minDurationSeconds: env.minVideoDurationSeconds,
      maxDurationSeconds: env.maxVideoDurationSeconds,
    }));
    addAsset(jobId, { kind: "render", path: rendered.path, mimeType: "video/mp4", size: videoStat.size });

    return updateJob(jobId, {
      status: "completed",
      stage: "completed",
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    return updateJob(jobId, {
      status: "failed",
      stage: "failed",
      error: error instanceof Error ? error.message : "Unknown pipeline error",
    });
  }
}

function applyAudioDurationsToStoryboard(storyboard: TestStoryboard, sceneAudioDurations: Record<string, number>): TestStoryboard {
  const transitionPadSeconds = 0.35;
  const minimumSceneSeconds = 2.5;
  const scenesWithAudio = storyboard.scenes.map((scene) => {
    const audioDuration = sceneAudioDurations[scene.id] ?? scene.durationInSeconds;
    return {
      ...scene,
      durationInSeconds: roundDuration(Math.max(scene.durationInSeconds, audioDuration + transitionPadSeconds, minimumSceneSeconds)),
    };
  });

  const naturalDuration = scenesWithAudio.reduce((sum, scene) => sum + scene.durationInSeconds, 0);
  const targetDuration = clamp(env.targetVideoDurationSeconds, env.minVideoDurationSeconds, env.maxVideoDurationSeconds);
  const desiredDuration = Math.max(env.minVideoDurationSeconds, Math.min(targetDuration, env.maxVideoDurationSeconds));

  let timedScenes = scenesWithAudio;
  if (naturalDuration < env.minVideoDurationSeconds) {
    const extraPerScene = (desiredDuration - naturalDuration) / Math.max(1, scenesWithAudio.length);
    timedScenes = scenesWithAudio.map((scene) => ({
      ...scene,
      durationInSeconds: roundDuration(scene.durationInSeconds + extraPerScene),
    }));
  }

  const totalDuration = timedScenes.reduce((sum, scene) => sum + scene.durationInSeconds, 0);
  const totalFrames = Math.ceil(totalDuration * storyboard.fps);
  console.log("storyboard_duration_resolved", JSON.stringify({
    audioDurations: sceneAudioDurations,
    fps: storyboard.fps,
    sceneDurations: timedScenes.map((scene) => ({ id: scene.id, durationInSeconds: scene.durationInSeconds })),
    totalDurationSeconds: totalDuration,
    totalFrames,
  }));

  return { ...storyboard, scenes: timedScenes };
}

function roundDuration(value: number): number {
  return Math.ceil(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

async function resolveProductImage(product: ProductInput, jobId: string): Promise<{ dataUrl: string; asset: TestPipelineAsset }> {
  const source = product.imageUrl;
  console.log("image_generation_started", JSON.stringify({ sourceField: "product.imageUrl", source, provider: "product-image-resolver", geminiImageGenerationCalled: false }));
  const directory = join(process.cwd(), env.storagePath, "output", "images");
  await mkdir(directory, { recursive: true });
  let buffer: Buffer;
  let mimeType = "image/svg+xml";
  let sourcePath: string;

  try {
    if (!source) throw new Error("product.imageUrl is empty");
    if (source.startsWith("data:")) {
      const match = source.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) throw new Error("product.imageUrl data URL is invalid");
      mimeType = match[1];
      buffer = Buffer.from(match[2], "base64");
      sourcePath = join(directory, `${jobId}-product-image`);
    } else if (source.startsWith("http://") || source.startsWith("https://")) {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`image URL returned HTTP ${response.status}`);
      buffer = Buffer.from(await response.arrayBuffer());
      mimeType = response.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
      sourcePath = join(directory, `${jobId}-product-image.${mimeType.split("/")[1] ?? "jpg"}`);
    } else {
      sourcePath = source;
      buffer = await readFile(source);
      mimeType = source.endsWith(".png") ? "image/png" : source.endsWith(".jpg") || source.endsWith(".jpeg") ? "image/jpeg" : "image/svg+xml";
    }
  } catch (error) {
    console.log("image_generation_completed", JSON.stringify({ sourceField: "product.imageUrl", source, fallback: true, reason: error instanceof Error ? error.message : "unknown" }));
    const escapedTitle = escapeXml(product.title);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280"><rect width="720" height="1280" fill="#0f172a"/><rect x="56" y="220" width="608" height="650" rx="40" fill="#e2e8f0"/><circle cx="360" cy="500" r="170" fill="#38bdf8"/><rect x="260" y="380" width="200" height="250" rx="50" fill="#f8fafc"/><rect x="300" y="340" width="120" height="50" rx="20" fill="#94a3b8"/><text x="360" y="980" text-anchor="middle" font-family="Arial" font-size="34" font-weight="700" fill="#f8fafc">${escapedTitle}</text><text x="360" y="1040" text-anchor="middle" font-family="Arial" font-size="24" fill="#bae6fd">Product image preview</text></svg>`;
    buffer = Buffer.from(svg);
    mimeType = "image/svg+xml";
    sourcePath = join(directory, `${jobId}-product-image.svg`);
  }

  await writeFile(sourcePath, buffer);
  const file = await stat(sourcePath);
  if (file.size === 0) throw new Error("Product image file is empty");
  console.log("image_file_verified", JSON.stringify({ path: sourcePath, size: file.size, mimeType }));
  console.log("image_generation_completed", JSON.stringify({ path: sourcePath, sourceField: "product.imageUrl", fallback: sourcePath.endsWith("product-image.svg") && !source?.endsWith(".svg") }));
  return {
    dataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
    asset: { kind: "image", path: sourcePath, mimeType, size: file.size },
  };
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character);
}

function addAsset(jobId: string, asset: TestPipelineAsset): void {
  const job = jobs.get(jobId);
  if (!job) return;
  jobs.set(jobId, { ...job, assets: [...job.assets, asset] });
}

export function createTestPipelineJob(product?: ProductInput, storyboard?: TestStoryboard): TestPipelineJob {
  const jobId = randomUUID();
  const job: TestPipelineJob = { jobId, status: "pending", stage: "queued", assets: [], createdAt: new Date().toISOString() };
  jobs.set(jobId, job);
  void runCompleteTestPipeline(product, storyboard, jobId);
  return job;
}

export function getTestPipelineJob(jobId: string): TestPipelineJob | undefined {
  return jobs.get(jobId);
}
