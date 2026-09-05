export interface GenerateVideoRequest {
  productId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  durationInSeconds?: number;
}

export interface GenerationResult {
  generationId: string;
  status: "completed" | "failed";
  videoPath?: string;
  message: string;
}