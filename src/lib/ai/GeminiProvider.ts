import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "./AIProvider";
import { AI_CONFIG, getGeminiApiKey } from "./config";
import { buildPlaylistPrompt } from "./prompts";
import { ResponseParser } from "./parsers/ResponseParser";
import type { GeneratePlaylistRequest, GeneratePlaylistResponse } from "./types";

export class GeminiProvider implements AIProvider {
  async generatePlaylist(request: GeneratePlaylistRequest): Promise<GeneratePlaylistResponse> {
    const prompt = buildPlaylistPrompt(request);
    try {
      const apiKey = getGeminiApiKey();
      const client = new GoogleGenAI({ apiKey });

      const response = await client.models.generateContent({
        model: AI_CONFIG.model,
        contents: prompt,
        config: {
          temperature: AI_CONFIG.temperature,
          responseMimeType: AI_CONFIG.responseMimeType,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
        },
      });

      const text = response.text?.trim();

      if (!text) {
        throw new Error("Empty response from Gemini.");
      }

      if (!text.endsWith("}")) {
        throw new Error("Gemini response appears truncated.");
      }

      let rawResponse: unknown;
      try {
        rawResponse = JSON.parse(text);
      } catch {
        throw new Error("Gemini returned invalid JSON.");
      }

      const parsedResponse = ResponseParser.parsePlaylist(rawResponse, request.maxSongs);
      return parsedResponse;
    } catch (error: unknown) {
      if (isControlledGeminiError(error)) {
        throw error;
      }

      throw new Error("Gemini request failed.");
    }
  }
}

function isControlledGeminiError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false;
  }

  return new Set([
    "AI returned an invalid payload.",
    "Songs array not found.",
    "Invalid song structure.",
    "Nenhuma música retornada.",
    "Empty response from Gemini.",
    "Gemini returned invalid JSON.",
    "Failed to parse Gemini response.",
  ]).has(error.message);
}
