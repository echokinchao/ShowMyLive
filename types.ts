export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type ViewAngle = 'front' | 'left' | 'right' | 'back';

export interface GeneratedViews {
  front: string;
  left: string;
  right: string;
  back: string;
}

export interface GenerationResult {
  views: GeneratedViews;
}