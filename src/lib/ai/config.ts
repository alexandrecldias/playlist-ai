const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_PROMPT_CHARS = 100;
const DEFAULT_MAX_SONGS = 30;
const DEFAULT_MAX_REQUESTS_PER_DAY = 5;
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;
const DEFAULT_RESPONSE_MIME_TYPE = "application/json";
const geminiModel = process.env.GEMINI_MODEL?.trim();
const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const aiProvider = process.env.AI_PROVIDER?.trim().toLowerCase();

export const AI_CONFIG = {
  enabled: Boolean(geminiApiKey),
  provider: aiProvider === "gemini" ? "gemini" : "gemini",
  model: geminiModel || DEFAULT_MODEL,
  temperature: DEFAULT_TEMPERATURE,
  maxPromptChars: DEFAULT_MAX_PROMPT_CHARS,
  maxSongs: DEFAULT_MAX_SONGS,
  maxRequestsPerDay: DEFAULT_MAX_REQUESTS_PER_DAY,
  maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
  responseMimeType: DEFAULT_RESPONSE_MIME_TYPE,
} as const;

export function getGeminiApiKey(): string {
  if (!geminiApiKey) {
    throw new Error("Missing environment variable: GEMINI_API_KEY");
  }

  return geminiApiKey;
}
