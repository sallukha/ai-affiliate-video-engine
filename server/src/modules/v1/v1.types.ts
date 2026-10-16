export type VideoStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
export type VideoStage = "validating" | "scripting" | "voiceover" | "rendering" | "saving";
export type VideoLanguage = "Hindi" | "English" | "Hinglish";
export type VideoTone = "Professional" | "Informative" | "Energetic" | "Promotional";
export type VideoDuration = 15 | 30 | 60;
export type VideoAspectRatio = "9:16" | "16:9";

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  affiliateUrl: string;
  imageUrl: string;
  sourceUrl?: string;
  videoCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface VideoScript {
  hook: string;
  problem: string;
  solution: string;
  callToAction: string;
  fullScript: string;
}

export interface VideoItem {
  id: string;
  title: string;
  productName: string;
  productId?: string;
  productUrl?: string;
  price?: number;
  currency?: string;
  affiliateUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration: VideoDuration;
  aspectRatio: VideoAspectRatio;
  language: VideoLanguage;
  tone: VideoTone;
  status: VideoStatus;
  currentStage?: VideoStage;
  progress: number;
  script?: VideoScript;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  workflowId?: string;
  fileSizeMb?: number;
  renderEngine?: string;
}

export interface WorkflowStageDetail {
  id: VideoStage;
  name: string;
  description: string;
  status: "pending" | "processing" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  logs: string[];
  errorMessage?: string;
}

export interface WorkflowRun {
  id: string;
  videoId: string;
  productName: string;
  status: VideoStatus;
  currentStage: VideoStage;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  errorMessage?: string;
  stages: WorkflowStageDetail[];
}
