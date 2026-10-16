export type StoryboardPromptType =
  | "story"
  | "scene"
  | "visual"
  | "voice-over"
  | "caption";

export interface StoryboardPrompt {
  id: string;
  name: string;
  type: StoryboardPromptType;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStoryboardPromptInput {
  name: string;
  type: StoryboardPromptType;
  template: string;
}

export interface UpdateStoryboardPromptInput {
  name?: string;
  type?: StoryboardPromptType;
  template?: string;
}