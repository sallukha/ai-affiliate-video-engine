import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "../../config/env";

const generatedSceneSchema = z.object({
  id: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  narration: z.string().min(1),
  caption: z.string().min(1).optional(),
});

const generatedContentSchema = z.object({
  hook: z.string().min(1).optional().default(""),
  script: z.string().min(1).optional().default(""),
  benefits: z.array(z.string().min(1)).optional().default([]),
  callToAction: z.string().min(1).optional().default(""),
  scenes: z.array(generatedSceneSchema).min(1),
});

export type GeneratedVideoContent = z.infer<typeof generatedContentSchema>;

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${env.providerTimeoutMs}ms`)), env.providerTimeoutMs);
    }),
  ]);
}

export async function generateAffiliateContent(input: {
  productTitle: string;
  productDescription?: string;
  productBenefits?: string[];
  storyboardSceneIds: string[];
  targetDurationSeconds?: number;
}): Promise<GeneratedVideoContent> {
  const targetDurationSeconds = input.targetDurationSeconds ?? env.targetVideoDurationSeconds;
  const prompt = [
    "Generate Hindi/Hinglish affiliate video content as strict JSON.",
    "Do not include markdown fences or extra keys.",
    `Product title: ${input.productTitle}`,
    `Product description: ${input.productDescription ?? ""}`,
    `Product benefits: ${(input.productBenefits ?? []).join("; ")}`,
    `Scene IDs, in order: ${input.storyboardSceneIds.join(", ")}`,
    `Target total video duration: ${targetDurationSeconds} seconds.`,
    "Write approximately 40-50 natural spoken Hindi/Hinglish words total across all scene narrations.",
    "Structure the content as: attention-grabbing hook, product introduction, two or three grounded benefits, and a natural call to action.",
    "Do not invent discounts, fake specifications, ratings, guarantees, or unsupported claims.",
    "Distribute narration naturally across the supplied scenes; each scene should have meaningful narration.",
    "Return exactly these keys: hook, script, benefits, callToAction, scenes.",
    "Each scenes item must contain id, text, narration, and caption. Preserve every supplied scene ID exactly once.",
    "Keep narration natural for Hindi/Hinglish speech and make captions short enough for vertical video.",
  ].join("\n");

  try {
    const response = await withTimeout(ai.models.generateContent({
      model: env.geminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }), "Gemini generation");
    const text = response.text?.trim();
    if (!text) throw new Error("Gemini returned an empty response");
    const parsed: unknown = JSON.parse(text);
    const content = normalizeGeneratedContent(generatedContentSchema.parse(parsed), input.storyboardSceneIds);
    const returnedIds = content.scenes.map((scene) => scene.id);
    if (returnedIds.length !== input.storyboardSceneIds.length || input.storyboardSceneIds.some((id) => !returnedIds.includes(id))) {
      throw new Error("Gemini response did not contain the required storyboard scene IDs");
    }
    const narrationWordCount = countWords(content.scenes.map((scene) => scene.narration).join(" "));
    console.log("gemini_script_generated", JSON.stringify({
      sceneCount: content.scenes.length,
      narrationWordCount,
      targetDurationSeconds,
    }));
    return content;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Gemini returned invalid JSON");
    if (error instanceof z.ZodError) throw new Error(`Gemini returned JSON with an invalid video schema: ${error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
    const message = error instanceof Error ? error.message : "Unknown Gemini error";
    throw new Error(`Gemini request failed: ${message}`);
  }
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeGeneratedContent(content: z.infer<typeof generatedContentSchema>, sceneIds: string[]): GeneratedVideoContent {
  const scenes = sceneIds.map((id, index) => {
    const scene = content.scenes.find((candidate) => candidate.id === id) ?? content.scenes[index];
    if (!scene?.narration?.trim()) {
      throw new Error(`Gemini response did not include narration for scene ${id}`);
    }
    const caption = (scene.caption ?? scene.text ?? scene.narration).trim();
    return {
      id,
      narration: scene.narration.trim(),
      caption,
      text: (scene.text ?? caption).trim(),
    };
  });

  const fullScript = content.script || scenes.map((scene) => scene.narration).join(" ");
  return {
    hook: content.hook || scenes[0]?.narration || fullScript,
    script: fullScript,
    benefits: content.benefits.length ? content.benefits : scenes.slice(1, -1).map((scene) => scene.caption),
    callToAction: content.callToAction || scenes[scenes.length - 1]?.narration || "",
    scenes,
  };
}

export async function testGeminiConnection(): Promise<GeneratedVideoContent> {
  return generateAffiliateContent({
    productTitle: "Daily planner app",
    productDescription: "A simple app for organizing daily tasks.",
    storyboardSceneIds: ["test"],
  });
}
