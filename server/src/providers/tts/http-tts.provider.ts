import type { GenerationAsset } from "../../modules/generation/generation.types";
import type { StorageAdapter } from "../storage/local-storage";
import { env } from "../../config/env";

export async function createAudioForScene(input: { generationId: string; sceneId: string; text: string; storage: StorageAdapter }): Promise<GenerationAsset | undefined> {
  if (!env.ttsApiUrl) return undefined;
  const response = await fetch(env.ttsApiUrl, {
    method: "POST",
    headers: { "content-type": "application/json", ...(env.ttsApiKey ? { authorization: `Bearer ${env.ttsApiKey}` } : {}) },
    body: JSON.stringify({ text: input.text }),
  });
  if (!response.ok) throw new Error(`TTS provider failed (${response.status})`);
  const payload = await response.json() as { audioUrl?: string; audioBase64?: string; mimeType?: string };
  if (payload.audioUrl) return { ...(await input.storage.importRemote(payload.audioUrl, `generations/${input.generationId}/scenes/${input.sceneId}/voice`)), sceneId: input.sceneId, kind: "audio" };
  if (!payload.audioBase64) throw new Error("TTS provider returned no audio");
  return { ...(await input.storage.write(`generations/${input.generationId}/scenes/${input.sceneId}/voice.mp3`, Buffer.from(payload.audioBase64, "base64"), payload.mimeType ?? "audio/mpeg")), sceneId: input.sceneId, kind: "audio" };
}
