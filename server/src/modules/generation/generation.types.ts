export interface GenerateVideoRequest {
  projectId?: string;
  userId?: string;
  storyboard?: StoryboardInput;
  productId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  durationInSeconds?: number;
}

export interface StoryboardSceneInput {
  id?: string;
  order?: number;
  durationInSeconds?: number;
  narration?: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  backgroundMusicUrl?: string;
}

export interface StoryboardInput {
  id?: string;
  scenes: StoryboardSceneInput[];
  width?: number;
  height?: number;
  fps?: number;
}

export type GenerationStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface GenerationAsset {
  id: string;
  sceneId?: string;
  kind: "video" | "audio" | "thumbnail" | "preview" | "final";
  storageKey: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface GenerationScene {
  id: string;
  order: number;
  status: GenerationStatus;
  durationInSeconds: number;
  narration?: string;
  assets: GenerationAsset[];
  error?: string;
}

export interface GenerationResult {
  generationId: string;
  status: GenerationStatus;
  videoPath?: string;
  message: string;
  projectId?: string;
  userId?: string;
  scenes?: GenerationScene[];
  assets?: GenerationAsset[];
}
