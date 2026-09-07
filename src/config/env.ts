import "dotenv/config";

function getEnv(name: string, required = true): string {
  const value = process.env[name];

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value ?? "";
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),

  geminiApiKey: getEnv("GEMINI_API_KEY"),
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  sarvamApiKey: getEnv("SARVAM_API_KEY"),
  sarvamApiUrl: process.env.SARVAM_API_URL ?? "https://api.sarvam.ai/text-to-speech",
  sarvamModel: process.env.SARVAM_MODEL ?? "bulbul:v3",
  sarvamSpeaker: process.env.SARVAM_SPEAKER ?? "shubh",
  providerTimeoutMs: Number(process.env.PROVIDER_TIMEOUT_MS ?? 60000),

  openaiApiKey: getEnv("OPENAI_API_KEY", false),

  ttsApiKey: getEnv("TTS_API_KEY", false),

  storagePath: process.env.STORAGE_PATH ?? "storage",
  ttsApiUrl: getEnv("TTS_API_URL", false),
  videoApiUrl: getEnv("VIDEO_API_URL", false),
  videoApiKey: getEnv("VIDEO_API_KEY", false),
  ffmpegPath: process.env.FFMPEG_PATH ?? "ffmpeg",
  remotionRenderCommand: getEnv("REMOTION_RENDER_COMMAND", false),
  maxGenerationRetries: Number(process.env.MAX_GENERATION_RETRIES ?? 2),
};