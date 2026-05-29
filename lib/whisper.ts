import OpenAI from "openai";
import fs from "fs";

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  words: TranscriptionWord[];
  language: string;
  duration: number;
}

export async function transcribeVideo(filePath: string): Promise<TranscriptionResult> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 0,
  });

  const fileStream = fs.createReadStream(filePath);

  const response = await client.audio.transcriptions.create({
    file: fileStream,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word", "segment"],
  });

  const words: TranscriptionWord[] = (response.words ?? []).map((w) => ({
    word: w.word,
    start: w.start,
    end: w.end,
  }));

  const segments: TranscriptionSegment[] = (response.segments ?? []).map((seg, idx) => ({
    id: idx,
    start: seg.start,
    end: seg.end,
    text: seg.text.trim(),
  }));

  const duration =
    words.length > 0
      ? words[words.length - 1].end
      : segments.length > 0
      ? segments[segments.length - 1].end
      : 0;

  return {
    text: response.text,
    segments,
    words,
    language: response.language ?? "unknown",
    duration,
  };
}
