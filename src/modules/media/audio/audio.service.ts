import { AudioAsset } from "./audio.types";

const audioStore: AudioAsset[] = [];

export const createAudio = (data: {
  url: string;
  mimeType: string;
  size?: number;
  duration?: number;
}): AudioAsset => {
  const audio: AudioAsset = {
    id: `audio_${Date.now()}`,
    ...data,
    createdAt: new Date(),
  };

  audioStore.push(audio);

  return audio;
};

export const getAllAudio = (): AudioAsset[] => {
  return audioStore;
};

export const getAudioById = (id: string): AudioAsset | undefined => {
  return audioStore.find((audio) => audio.id === id);
};

export const deleteAudio = (id: string): boolean => {
  const index = audioStore.findIndex((audio) => audio.id === id);

  if (index === -1) {
    return false;
  }

  audioStore.splice(index, 1);

  return true;
};