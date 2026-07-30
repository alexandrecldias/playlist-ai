import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "./AIProvider";
import { AI_CONFIG, getGeminiApiKey } from "./config";
import { buildPlaylistPrompt } from "./prompts";
import { ResponseParser } from "./parsers/ResponseParser";
import type { GeneratePlaylistRequest, GeneratePlaylistResponse } from "./types";

export class GeminiProvider implements AIProvider {
  async generatePlaylist(request: GeneratePlaylistRequest): Promise<GeneratePlaylistResponse> {
    logAi("Request started", {
      provider: AI_CONFIG.provider,
      model: AI_CONFIG.model,
    });

    const prompt = buildPlaylistPrompt(request);
    logAi("Prompt generated", {
      promptChars: prompt.length,
    });

    try {
      const apiKey = getGeminiApiKey();
      const client = new GoogleGenAI({ apiKey });

      logAi("Calling Gemini", {
        model: AI_CONFIG.model,
      });

      const response = await client.models.generateContent({
        model: AI_CONFIG.model,
        contents: prompt,
        config: {
          temperature: AI_CONFIG.temperature,
          responseMimeType: AI_CONFIG.responseMimeType,
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
        },
      });

      logAi("Gemini response received");


      const text = response.text?.trim();

      console.log("========== GEMINI ==========");
      console.log(text);
      console.log("============================");

      if (!text) {
        throw new Error("Empty response from Gemini.");
      }

      if (!text.endsWith("}")) {
        throw new Error("Gemini response appears truncated.");
      }

      logAi("Parsing response");

      let rawResponse: unknown;
      try {
        rawResponse = JSON.parse(text);
      } catch {
        throw new Error("Gemini returned invalid JSON.");
      }

      const parsedResponse = ResponseParser.parsePlaylist(rawResponse, request.maxSongs);

      logAi("Response parsed successfully");
      logAi("Songs returned", {
        count: parsedResponse.songs.length,
      });
      logAi("Request completed");

      return parsedResponse;
    } catch (error: unknown) {
      logAiError("Gemini request failed");

      console.error(error);

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

function logAi(message: string, details?: Record<string, unknown>): void {
  if (details) {
    console.info(`[AI] ${message}`, details);
    return;
  }

  console.info(`[AI] ${message}`);
}

function logAiError(message: string): void {
  console.error(`[AI] ${message}`);
}
