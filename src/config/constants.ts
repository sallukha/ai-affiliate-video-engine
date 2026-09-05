export const APP_NAME = 'ai-affiliate-video-engine';
export const APP_NAME = "AI Affiliate Video Engine";

export const DEFAULT_PORT = 5000;

export const STORAGE_DIRECTORIES = {
  input: "storage/input",
  output: "storage/output",
  temp: "storage/temp",
} as const;

export const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  codec: "h264",
  format: "mp4",
} as const;

export const AUDIO_CONFIG = {
  format: "mp3",
  sampleRate: 44100,
} as const;

export const FILE_LIMITS = {
  maxImageSizeMB: 10,
  maxAudioSizeMB: 25,
  maxVideoSizeMB: 100,
} as const;

export const API_PREFIX = "/api";

export const ROUTES = {
  health: `${API_PREFIX}/health`,
  products: `${API_PREFIX}/products`,
  videos: `${API_PREFIX}/videos`,
  generation: `${API_PREFIX}/generation`,
} as const;