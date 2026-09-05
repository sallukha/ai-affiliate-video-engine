export interface ImageAsset {
  id: string;
  url: string;
  mimeType: string;
  size?: number;
  width?: number;
  height?: number;
  createdAt: Date;
}