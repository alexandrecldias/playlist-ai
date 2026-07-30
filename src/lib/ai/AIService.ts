import { AI_CONFIG } from "./config";
import { GeminiProvider } from "./GeminiProvider";
import type { AIProvider } from "./AIProvider";
import type { GeneratePlaylistRequest, GeneratePlaylistResponse } from "./types";

export class AIService {
  constructor(private readonly provider: AIProvider = AIService.createDefaultProvider()) {}

  async generatePlaylist(request: GeneratePlaylistRequest): Promise<GeneratePlaylistResponse> {
    this.validateRequest(request);
    return this.provider.generatePlaylist(request);
  }

  private validateRequest(request: GeneratePlaylistRequest): void {
    if (!AI_CONFIG.enabled) {
      throw new Error("ai_disabled");
    }

    if (request.prompt.length > AI_CONFIG.maxPromptChars) {
      throw new Error("prompt_too_long");
    }

    if (!Number.isInteger(request.maxSongs) || request.maxSongs < 1 || request.maxSongs > AI_CONFIG.maxSongs) {
      throw new Error("invalid_max_songs");
    }
  }

  private static createDefaultProvider(): AIProvider {
    switch (AI_CONFIG.provider) {
      case "gemini":
      default:
        return new GeminiProvider();
    }
  }
}
