export type PromptType =
  | "product-video"
  | "voice-over"
  | "product-image"
  | "caption"
  | "hashtags";

export interface PromptTemplate {
  id: string;
  name: string;
  type: PromptType;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromptInput {
  name: string;
  type: PromptType;
  template: string;
}

export interface UpdatePromptInput {
  name?: string;
  type?: PromptType;
  template?: string;
}