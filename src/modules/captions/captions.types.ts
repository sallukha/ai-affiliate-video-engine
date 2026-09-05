export interface CaptionWord {
  text: string;
  start: number;
  end: number;
}

export interface CaptionSegment {
  id: number;
  text: string;
  start: number;
  end: number;
  words?: CaptionWord[];
}

export interface GenerateCaptionsInput {
  text: string;
  durationInSeconds: number;
}

export interface CaptionResponse {
  segments: CaptionSegment[];
  durationInSeconds: number;
}