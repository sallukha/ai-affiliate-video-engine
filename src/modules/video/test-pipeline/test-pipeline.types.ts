export type TestPipelineStatus = "pending" | "processing" | "completed" | "failed";

export interface ProductInput {
  id?: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  benefits?: string[];
  imageUrl?: string;
  sourceUrl?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TestStoryboardScene {
  id: string;
  order: number;
  durationInSeconds: number;
  text: string;
  narration: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface TestStoryboard {
  id: string;
  width: number;
  height: number;
  fps: number;
  scenes: TestStoryboardScene[];
  productImage?: string;
}

export interface TestPipelineAsset {
  kind: "voice" | "image" | "render" | "final" | "thumbnail";
  path: string;
  mimeType: string;
  size: number;
}

export interface TestPipelineJob {
  jobId: string;
  status: TestPipelineStatus;
  stage?: string;
  assets: TestPipelineAsset[];
  error?: string;
  createdAt: string;
  completedAt?: string;
}
