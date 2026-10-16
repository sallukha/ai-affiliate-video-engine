import { ImageAsset } from "./image.types";

const imageStore: ImageAsset[] = [];

export const createImage = (data: {
  url: string;
  mimeType: string;
  size?: number;
  width?: number;
  height?: number;
}): ImageAsset => {
  const image: ImageAsset = {
    id: `image_${Date.now()}`,
    ...data,
    createdAt: new Date(),
  };

  imageStore.push(image);

  return image;
};

export const getAllImages = (): ImageAsset[] => {
  return imageStore;
};

export const getImageById = (id: string): ImageAsset | undefined => {
  return imageStore.find((image) => image.id === id);
};

export const deleteImage = (id: string): boolean => {
  const index = imageStore.findIndex((image) => image.id === id);

  if (index === -1) {
    return false;
  }

  imageStore.splice(index, 1);

  return true;
};