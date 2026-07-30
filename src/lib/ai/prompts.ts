import type { GeneratePlaylistRequest } from "./types";

export function buildPlaylistPrompt(request: GeneratePlaylistRequest): string {
  return [
    "You are a playlist generator.",
    `Generate up to ${request.maxSongs} songs.`,
    "Return ONLY valid JSON.",
    'Use exactly this shape: {"songs":[{"title":"...","artist":"..."}]}',
    "Do not return markdown, code fences, explanations, or extra keys.",
    "",
    request.prompt.trim(),
  ].join("\n");
}
