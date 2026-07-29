import { randomBytes, createHash } from "crypto";
import { SPOTIFY_TOKEN_URL } from "@/lib/spotify/constants";
import { SpotifyTokenError, SpotifyTokenSuccess } from "@/lib/spotify/types";

export function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(64));
}

export function generateCodeChallenge(codeVerifier: string): string {
  const hash = createHash("sha256").update(codeVerifier).digest();
  return base64UrlEncode(hash);
}

export function generateState(): string {
  return base64UrlEncode(randomBytes(32));
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function validateEnv() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } = process.env;
  if (!SPOTIFY_CLIENT_ID) {
    throw new Error("Missing environment variable: SPOTIFY_CLIENT_ID");
  }
  if (!SPOTIFY_REDIRECT_URI) {
    throw new Error("Missing environment variable: SPOTIFY_REDIRECT_URI");
  }
  return { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI };
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
): Promise<SpotifyTokenSuccess> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } = validateEnv();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    let errBody: SpotifyTokenError | null = null;
    try {
      errBody = (await res.json()) as SpotifyTokenError;
    } catch {
      // ignore
    }
    throw new Error(errBody?.error_description ?? `token_exchange_failed:${res.status}`);
  }

  const data = (await res.json()) as SpotifyTokenSuccess;
  if (!data.access_token) {
    throw new Error("token response missing access_token");
  }
  return data;
}

export async function exchangeRefreshToken(refreshToken: string): Promise<SpotifyTokenSuccess> {
  const { SPOTIFY_CLIENT_ID } = validateEnv();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: SPOTIFY_CLIENT_ID,
  });

  let res: Response;
  try {
    res = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch {
    throw new Error("token_exchange_network_error");
  }

  if (!res.ok) {
    let errBody: SpotifyTokenError | null = null;
    try {
      errBody = (await res.json()) as SpotifyTokenError;
    } catch {
      // ignore
    }
    if (res.status === 400 || res.status === 401) {
      throw new Error("invalid_refresh_token");
    }
    throw new Error(errBody?.error_description ?? `token_exchange_failed:${res.status}`);
  }

  const data = (await res.json()) as SpotifyTokenSuccess;
  if (!data.access_token) {
    throw new Error("token response missing access_token");
  }

  return data;
}

export function isTokenExpiring(expiresAtMs: number | undefined, marginMs = 60_000): boolean {
  if (typeof expiresAtMs !== "number") return true;
  return expiresAtMs <= Date.now() + marginMs;
}

export type SpotifyTokenValidationResult = {
  accessToken: string;
  refreshToken?: string;
  expiresAtMs: number;
  refreshed: boolean;
  tokenData?: SpotifyTokenSuccess;
};

export async function getSpotifyAccessToken(
  accessToken: string | undefined,
  refreshToken: string | undefined,
  expiresAtMs: number | undefined,
  forceRefresh = false,
): Promise<SpotifyTokenValidationResult> {
  if (!forceRefresh && accessToken && !isTokenExpiring(expiresAtMs)) {
    return {
      accessToken,
      refreshToken,
      expiresAtMs: expiresAtMs ?? Date.now() + 60_000,
      refreshed: false,
    };
  }

  if (!refreshToken) {
    throw new Error("refresh_missing");
  }

  const tokenData = await exchangeRefreshToken(refreshToken);
  const newExpiresAtMs = Date.now() + tokenData.expires_in * 1000;

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token ?? refreshToken,
    expiresAtMs: newExpiresAtMs,
    refreshed: true,
    tokenData,
  };
}

