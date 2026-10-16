import { randomUUID } from "node:crypto";
import { relative, sep } from "node:path";
import { z } from "zod";
import { env } from "../../config/env";
import { createTestPipelineJob, getTestPipelineJob } from "../video/test-pipeline/test-pipeline.service";
import type { ProductInput, TestPipelineJob } from "../video/test-pipeline/test-pipeline.types";
import type {
  ProductItem,
  VideoAspectRatio,
  VideoDuration,
  VideoItem,
  VideoLanguage,
  VideoStage,
  VideoStatus,
  VideoTone,
  WorkflowRun,
  WorkflowStageDetail,
} from "./v1.types";

const productSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
  price: z.coerce.number().nonnegative(),
  currency: z.string().trim().min(1).default("INR"),
  features: z.array(z.string()).optional().default([]),
  affiliateUrl: z.string().url(),
  imageUrl: z.string().optional().default(""),
  sourceUrl: z.string().url().optional(),
});

const createVideoSchema = z.object({
  inputMethod: z.enum(["url", "manual"]),
  productUrl: z.string().url().optional(),
  productDetails: productSchema.partial().optional(),
  videoConfig: z.object({
    language: z.enum(["Hindi", "English", "Hinglish"]).default("Hinglish"),
    tone: z.enum(["Professional", "Informative", "Energetic", "Promotional"]).default("Energetic"),
    duration: z.union([z.literal(15), z.literal(30), z.literal(60)]).default(30),
    aspectRatio: z.enum(["9:16", "16:9"]).default("9:16"),
    customInstructions: z.string().optional(),
  }).default({
    language: "Hinglish",
    tone: "Energetic",
    duration: 30,
    aspectRatio: "9:16",
  }),
});

const importSchema = z.object({
  products: z.array(productSchema).min(1),
});

const products = new Map<string, ProductItem>();
const videos = new Map<string, VideoItem>();
const workflows = new Map<string, WorkflowRun>();
const videoToPipelineJob = new Map<string, string>();

const stageMeta: Record<VideoStage, { name: string; description: string }> = {
  validating: {
    name: "Validating product information",
    description: "Verify product parameters, image asset availability, and affiliate link format",
  },
  scripting: {
    name: "Generating AI script",
    description: "Generate product copy and scene narration with Gemini",
  },
  voiceover: {
    name: "Generating voiceover",
    description: "Synthesize narration with Sarvam Bulbul TTS",
  },
  rendering: {
    name: "Rendering video",
    description: "Render the storyboard with Remotion",
  },
  saving: {
    name: "Saving final output",
    description: "Write the final MP4 and verify the output asset",
  },
};

const stageOrder: VideoStage[] = ["validating", "scripting", "voiceover", "rendering", "saving"];

export function listProducts(): ProductItem[] {
  return [...products.values()].sort(sortNewest);
}

export function createProduct(input: unknown): ProductItem {
  const parsed = productSchema.parse(input);
  const now = new Date().toISOString();
  const product: ProductItem = {
    id: randomUUID(),
    name: parsed.name,
    description: parsed.description,
    price: parsed.price,
    currency: parsed.currency,
    features: parsed.features.filter(Boolean),
    affiliateUrl: parsed.affiliateUrl,
    imageUrl: parsed.imageUrl,
    sourceUrl: parsed.sourceUrl,
    videoCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  products.set(product.id, product);
  return product;
}

export function getProduct(id: string): ProductItem | undefined {
  return products.get(id);
}

export function updateProduct(id: string, input: unknown): ProductItem | undefined {
  const existing = products.get(id);
  if (!existing) return undefined;
  const parsed = productSchema.partial().parse(input);
  const updated: ProductItem = {
    ...existing,
    ...parsed,
    features: parsed.features ?? existing.features,
    updatedAt: new Date().toISOString(),
  };
  products.set(id, updated);
  return updated;
}

export function deleteProduct(id: string): boolean {
  return products.delete(id);
}

export function importProducts(input: unknown): { importedCount: number; errors: string[] } {
  const parsed = importSchema.safeParse(input);
  if (!parsed.success) {
    return { importedCount: 0, errors: parsed.error.issues.map((issue) => issue.message) };
  }
  parsed.data.products.forEach((product) => createProduct(product));
  return { importedCount: parsed.data.products.length, errors: [] };
}

export function createVideo(input: unknown): { video: VideoItem; workflowId: string } {
  const parsed = createVideoSchema.parse(input);
  const details = getProductDetails(parsed);
  const product = findOrCreateProduct(details);
  const now = new Date().toISOString();
  const videoId = randomUUID();
  const workflowId = `wf-${videoId}`;
  const config = parsed.videoConfig;
  const video: VideoItem = {
    id: videoId,
    title: `Promote: ${details.name}`,
    productName: details.name,
    productId: product.id,
    productUrl: parsed.productUrl,
    price: details.price,
    currency: details.currency,
    affiliateUrl: details.affiliateUrl,
    thumbnailUrl: details.imageUrl,
    duration: config.duration as VideoDuration,
    aspectRatio: config.aspectRatio as VideoAspectRatio,
    language: config.language as VideoLanguage,
    tone: config.tone as VideoTone,
    status: "pending",
    currentStage: "validating",
    progress: 5,
    createdAt: now,
    workflowId,
    renderEngine: "Gemini + Sarvam Bulbul + Remotion 4 + FFmpeg",
    script: {
      hook: "",
      problem: "",
      solution: "",
      callToAction: "",
      fullScript: config.customInstructions ?? "",
    },
  };
  videos.set(videoId, video);
  workflows.set(workflowId, createWorkflow(workflowId, videoId, details.name, now));
  products.set(product.id, { ...product, videoCount: product.videoCount + 1, updatedAt: now });

  const pipelineProduct: ProductInput = {
    id: product.id,
    title: details.name,
    description: [details.description, config.customInstructions].filter(Boolean).join("\n\n"),
    price: details.price,
    currency: details.currency,
    benefits: details.features,
    imageUrl: details.imageUrl.trim() || undefined,
    sourceUrl: parsed.productUrl ?? details.sourceUrl,
    metadata: {
      affiliateUrl: details.affiliateUrl,
      language: config.language,
      tone: config.tone,
      duration: config.duration,
      aspectRatio: config.aspectRatio,
    },
  };
  const pipelineJob = createTestPipelineJob(pipelineProduct);
  videoToPipelineJob.set(videoId, pipelineJob.jobId);
  return { video: syncVideo(videoId), workflowId };
}

export function listVideos(): VideoItem[] {
  return [...videos.keys()].map(syncVideo).sort(sortNewest);
}

export function getVideo(id: string): VideoItem | undefined {
  if (!videos.has(id)) return undefined;
  return syncVideo(id);
}

export function cancelVideo(id: string): VideoItem | undefined {
  const video = videos.get(id);
  if (!video) return undefined;
  const updated: VideoItem = {
    ...video,
    status: "cancelled",
    errorMessage: "Job cancelled by user request. The local prototype worker cannot interrupt an already running render.",
  };
  videos.set(id, updated);
  syncWorkflow(id, undefined, updated);
  return updated;
}

export function retryVideo(id: string): VideoItem | undefined {
  const current = videos.get(id);
  if (!current) return undefined;
  return createVideo({
    inputMethod: "manual",
    productDetails: {
      name: current.productName,
      description: current.script?.fullScript || "",
      price: current.price ?? 0,
      currency: current.currency ?? "INR",
      features: [],
      affiliateUrl: current.affiliateUrl ?? "https://affiliate.example.com",
      imageUrl: current.thumbnailUrl ?? "",
    },
    videoConfig: {
      language: current.language,
      tone: current.tone,
      duration: current.duration,
      aspectRatio: current.aspectRatio,
    },
  }).video;
}

export function listWorkflows(): WorkflowRun[] {
  [...videos.keys()].forEach((id) => syncVideo(id));
  return [...workflows.values()].sort(sortStartedNewest);
}

export function getWorkflow(id: string): WorkflowRun | undefined {
  const video = [...videos.values()].find((candidate) => candidate.workflowId === id || candidate.id === id);
  if (video) syncVideo(video.id);
  return workflows.get(id) ?? (video?.workflowId ? workflows.get(video.workflowId) : undefined);
}

export function getAnalytics() {
  const allVideos = listVideos();
  const completedVideos = allVideos.filter((video) => video.status === "completed").length;
  const failedJobs = allVideos.filter((video) => video.status === "failed").length;
  const processingVideos = allVideos.filter((video) => video.status === "processing" || video.status === "pending").length;
  return {
    totalVideos: allVideos.length,
    completedVideos,
    processingVideos,
    failedJobs,
    successRate: allVideos.length ? Math.round((completedVideos / allVideos.length) * 100) : 0,
    averageProcessingTimeSec: averageCompletedDuration(),
    activityTimeline: buildTimeline(allVideos),
    stageDurations: stageOrder.map((stage) => ({ stage, avgSeconds: 0 })),
    topProducts: listProducts().map((product) => ({ name: product.name, videoCount: product.videoCount })).sort((a, b) => b.videoCount - a.videoCount).slice(0, 5),
    languageDistribution: countBy(allVideos, "language"),
    ratioDistribution: countBy(allVideos, "aspectRatio"),
  };
}

function getProductDetails(parsed: z.infer<typeof createVideoSchema>): Omit<ProductItem, "id" | "videoCount" | "createdAt" | "updatedAt"> {
  if (parsed.inputMethod === "url") {
    const url = new URL(parsed.productUrl ?? "");
    return {
      name: parsed.productDetails?.name ?? `Product from ${url.hostname}`,
      description: parsed.productDetails?.description ?? "Product URL submitted for affiliate video generation. Manual details are recommended when extraction is unavailable.",
      price: parsed.productDetails?.price ?? 0,
      currency: parsed.productDetails?.currency ?? "INR",
      features: parsed.productDetails?.features ?? ["Affiliate product", "URL submitted"],
      affiliateUrl: parsed.productDetails?.affiliateUrl ?? parsed.productUrl ?? "",
      imageUrl: parsed.productDetails?.imageUrl ?? "",
      sourceUrl: parsed.productUrl,
    };
  }
  const details = productSchema.parse(parsed.productDetails);
  return details;
}

function findOrCreateProduct(details: Omit<ProductItem, "id" | "videoCount" | "createdAt" | "updatedAt">): ProductItem {
  const existing = [...products.values()].find((product) => product.affiliateUrl === details.affiliateUrl && product.name === details.name);
  if (existing) return existing;
  return createProduct(details);
}

function createWorkflow(id: string, videoId: string, productName: string, now: string): WorkflowRun {
  return {
    id,
    videoId,
    productName,
    status: "pending",
    currentStage: "validating",
    startedAt: now,
    stages: stageOrder.map((stage) => ({
      id: stage,
      name: stageMeta[stage].name,
      description: stageMeta[stage].description,
      status: stage === "validating" ? "processing" : "pending",
      startedAt: stage === "validating" ? now : undefined,
      logs: stage === "validating" ? [`[${now}] Generation request accepted`] : [],
    })),
  };
}

function syncVideo(videoId: string): VideoItem {
  const video = videos.get(videoId);
  if (!video) throw new Error(`Unknown video: ${videoId}`);
  if (video.status === "cancelled") return video;
  const pipelineJobId = videoToPipelineJob.get(videoId);
  const pipelineJob = pipelineJobId ? getTestPipelineJob(pipelineJobId) : undefined;
  const updated = applyPipelineJob(video, pipelineJob);
  videos.set(videoId, updated);
  syncWorkflow(videoId, pipelineJob, updated);
  return updated;
}

function applyPipelineJob(video: VideoItem, job?: TestPipelineJob): VideoItem {
  if (!job) return video;
  const currentStage = mapPipelineStage(job.stage);
  const status = mapPipelineStatus(job.status);
  const render = job.assets.find((asset) => asset.kind === "render");
  return {
    ...video,
    status,
    currentStage,
    progress: status === "completed" ? 100 : status === "failed" ? progressForStage(currentStage) : Math.max(video.progress, progressForStage(currentStage)),
    completedAt: job.completedAt ?? video.completedAt,
    errorMessage: job.error,
    videoUrl: render ? storageUrl(render.path) : video.videoUrl,
    fileSizeMb: render ? Math.round((render.size / 1024 / 1024) * 100) / 100 : video.fileSizeMb,
  };
}

function syncWorkflow(videoId: string, job: TestPipelineJob | undefined, video: VideoItem): void {
  if (!video.workflowId) return;
  const workflow = workflows.get(video.workflowId);
  if (!workflow) return;
  const currentStage = video.currentStage ?? "validating";
  const now = new Date().toISOString();
  const currentIndex = stageOrder.indexOf(currentStage);
  const stages: WorkflowStageDetail[] = workflow.stages.map((stage, index) => {
    const isPast = index < currentIndex || video.status === "completed";
    const isCurrent = index === currentIndex;
    const status = video.status === "failed" && isCurrent ? "failed" : isPast ? "completed" : isCurrent ? "processing" : "pending";
    const logs = [...stage.logs];
    if (job && isCurrent && logs.length < 2) logs.push(`[${now}] Pipeline stage: ${job.stage ?? "queued"}`);
    if (video.status === "completed" && stage.id === "saving" && !logs.some((log) => log.includes("completed"))) logs.push(`[${now}] Final video output verified`);
    if (video.status === "failed" && isCurrent && video.errorMessage) logs.push(`[${now}] ERROR ${video.errorMessage}`);
    return {
      ...stage,
      status,
      startedAt: stage.startedAt ?? (status !== "pending" ? now : undefined),
      completedAt: stage.completedAt ?? (isPast ? now : undefined),
      logs,
      errorMessage: status === "failed" ? video.errorMessage : undefined,
    };
  });
  workflows.set(video.workflowId, {
    ...workflow,
    status: video.status,
    currentStage,
    completedAt: video.completedAt,
    durationSeconds: video.completedAt ? Math.max(1, Math.round((new Date(video.completedAt).getTime() - new Date(workflow.startedAt).getTime()) / 1000)) : undefined,
    errorMessage: video.errorMessage,
    stages,
  });
}

function mapPipelineStatus(status: TestPipelineJob["status"]): VideoStatus {
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  if (status === "pending") return "pending";
  return "processing";
}

function mapPipelineStage(stage?: string): VideoStage {
  if (stage === "gemini-script") return "scripting";
  if (stage === "sarvam-voice") return "voiceover";
  if (stage === "remotion-render") return "rendering";
  if (stage === "completed") return "saving";
  if (stage === "failed") return "saving";
  return "validating";
}

function progressForStage(stage: VideoStage): number {
  return { validating: 15, scripting: 35, voiceover: 60, rendering: 85, saving: 95 }[stage];
}

function storageUrl(path: string): string {
  const marker = `${sep}${env.storagePath}${sep}`;
  const normalized = path.includes(marker) ? path.slice(path.indexOf(marker) + marker.length) : relative(env.storagePath, path);
  return `/storage/${normalized.split(sep).join("/")}`;
}

function sortNewest<T extends { createdAt: string }>(a: T, b: T): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function sortStartedNewest(a: WorkflowRun, b: WorkflowRun): number {
  return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
}

function averageCompletedDuration(): number {
  const completed = listWorkflows().filter((workflow) => workflow.durationSeconds);
  if (completed.length === 0) return 0;
  return Math.round(completed.reduce((sum, workflow) => sum + (workflow.durationSeconds ?? 0), 0) / completed.length);
}

function buildTimeline(allVideos: VideoItem[]) {
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    return date.toISOString().slice(0, 10);
  });
  return days.map((date) => ({
    date,
    completed: allVideos.filter((video) => video.createdAt.slice(0, 10) === date && video.status === "completed").length,
    failed: allVideos.filter((video) => video.createdAt.slice(0, 10) === date && video.status === "failed").length,
  }));
}

function countBy<T, K extends keyof T>(items: T[], key: K) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const value = String(item[key] ?? "Unknown");
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}
