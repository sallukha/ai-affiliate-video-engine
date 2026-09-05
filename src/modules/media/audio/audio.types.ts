export interface AudioAsset {
  id: string;
  url: string;
  mimeType: string;
  size?: number;
  duration?: number;
  createdAt: Date;
}