import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "../../config/env";

const generatedSceneSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  narration: z.string().min(1),
  caption: z.string().min(1),
});

const generatedContentSchema = z.object({
  hook: z.string().min(1),
  script: z.string().min(1),
  benefits: z.array(z.string().min(1)).min(1),
  callToAction: z.string().min(1),
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
}): Promise<GeneratedVideoContent> {
  const prompt = [
    "Generate Hindi/Hinglish affiliate video content as strict JSON.",
    "Do not include markdown fences or extra keys.",
    `Product title: ${input.productTitle}`,
    `Product description: ${input.productDescription ?? ""}`,
    `Product benefits: ${(input.productBenefits ?? []).join("; ")}`,
    `Scene IDs, in order: ${input.storyboardSceneIds.join(", ")}`,
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
    const content = generatedContentSchema.parse(parsed);
    const returnedIds = content.scenes.map((scene) => scene.id);
    if (returnedIds.length !== input.storyboardSceneIds.length || input.storyboardSceneIds.some((id) => !returnedIds.includes(id))) {
      throw new Error("Gemini response did not contain the required storyboard scene IDs");
    }
    return content;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Gemini returned invalid JSON");
    if (error instanceof z.ZodError) throw new Error("Gemini returned JSON with an invalid video schema");
    const message = error instanceof Error ? error.message : "Unknown Gemini error";
    throw new Error(`Gemini request failed: ${message}`);
  }
}

export async function testGeminiConnection(): Promise<GeneratedVideoContent> {
  return generateAffiliateContent({
    productTitle: "Daily planner app",
    productDescription: "A simple app for organizing daily tasks.",
    storyboardSceneIds: ["test"],
  });
}
