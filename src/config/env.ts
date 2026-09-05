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

  openaiApiKey: getEnv("OPENAI_API_KEY", false),

  ttsApiKey: getEnv("TTS_API_KEY", false),

  storagePath: process.env.STORAGE_PATH ?? "storage",
};