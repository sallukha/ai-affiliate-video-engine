import type {
  CaptionSegment,
  GenerateCaptionsInput,
  CaptionResponse,
} from "./captions.types";

export function generateCaptions(
  input: GenerateCaptionsInput
): CaptionResponse {
  const words = input.text.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return {
      segments: [],
      durationInSeconds: input.durationInSeconds,
    };
  }

  const secondsPerWord =
    input.durationInSeconds / words.length;

  const segments: CaptionSegment[] = [];

  let currentText: string[] = [];
  let segmentStart = 0;
  let segmentId = 1;

  words.forEach((word, index) => {
    currentText.push(word);

    const isEndOfSegment =
      currentText.length >= 5 ||
      index === words.length - 1;

    if (isEndOfSegment) {
      const segmentEnd = Number(
        ((index + 1) * secondsPerWord).toFixed(2)
      );

      segments.push({
        id: segmentId,
        text: currentText.join(" "),
        start: Number(segmentStart.toFixed(2)),
        end: segmentEnd,
      });

      currentText = [];
      segmentStart = segmentEnd;
      segmentId++;
    }
  });

  return {
    segments,
    durationInSeconds: input.durationInSeconds,
  };
}