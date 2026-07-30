import { AIService } from "./AIService";
import type { GeneratePlaylistResponse } from "./types";

export async function runGeminiPlaylistTest(): Promise<GeneratePlaylistResponse> {
  const service = new AIService();
  return service.generatePlaylist({
    prompt: "Crie uma playlist de rock nacional dos anos 80.",
    maxSongs: 5,
  });
}
