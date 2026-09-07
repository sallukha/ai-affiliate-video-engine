import { mkdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";

export interface SarvamAudioAsset {
  path: string;
  dataUrl: string;
  mimeType: "audio/wav" | "audio/mpeg";
  size: number;
}

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${env.providerTimeoutMs}ms`)), env.providerTimeoutMs);
    }),
  ]);
}

export async function synthesizeSarvamSpeech(input: { text: string; sceneId: string }): Promise<SarvamAudioAsset> {
  const text = input.text.trim();
  if (!text) throw new Error(`Cannot synthesize empty text for scene ${input.sceneId}`);

  let response: Response;
  try {
    response = await withTimeout(fetch(env.sarvamApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": env.sarvamApiKey,
      },
      body: JSON.stringify({
        inputs: [text],
        target_language_code: "hi-IN",
        speaker: env.sarvamSpeaker,
        model: env.sarvamModel,
        enable_preprocessing: true,
        speech_sample_rate: 24000,
      }),
    }), "Sarvam TTS request");
  } catch (error) {
    throw new Error(`Sarvam TTS request failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Sarvam TTS failed with HTTP ${response.status}: ${detail}`);
  }

  const payload = await response.json() as { audios?: unknown };
  const encoded = Array.isArray(payload.audios) && typeof payload.audios[0] === "string" ? payload.audios[0] : undefined;
  if (!encoded) throw new Error("Sarvam TTS returned no audio data");

  const buffer = Buffer.from(encoded, "base64");
  if (buffer.length < 100) throw new Error("Sarvam TTS returned an invalid audio payload");
  const directory = join(process.cwd(), env.storagePath, "output", "audio");
  await mkdir(directory, { recursive: true });
  const path = join(directory, `${input.sceneId}-${randomUUID()}.wav`);
  await writeFile(path, buffer);
  const metadata = await stat(path);
  return {
    path,
    dataUrl: `data:audio/wav;base64,${buffer.toString("base64")}`,
    mimeType: "audio/wav",
    size: metadata.size,
  };
}

export async function testSarvamConnection(): Promise<SarvamAudioAsset> {
  return synthesizeSarvamSpeech({ sceneId: "connection-test", text: "नमस्ते, यह Sarvam Bulbul voice test है।" });
}
