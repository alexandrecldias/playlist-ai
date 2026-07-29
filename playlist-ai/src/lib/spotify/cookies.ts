import { SpotifyTokenSuccess } from "@/lib/spotify/types";

export const COOKIE_NAMES = {
  accessToken: "spotify_access_token",
  refreshToken: "spotify_refresh_token",
  expiresAt: "spotify_expires_at",
  codeVerifier: "spotify_code_verifier",
  authState: "spotify_auth_state",
} as const;

export const COOKIE_OPTIONS = (isProd: boolean) => ({
  httpOnly: true as const,
  path: "/" as const,
  sameSite: "lax" as const,
  secure: isProd,
});

export type CookieWriter = {
  set(cookie: {
    name: string;
    value: string;
    path: string;
    sameSite: "lax";
    httpOnly: true;
    secure: boolean;
    maxAge?: number;
  }): void;
};

export function setAuthTokenCookies(writer: CookieWriter, tokenData: SpotifyTokenSuccess, isProd: boolean) {
  writer.set({
    name: COOKIE_NAMES.accessToken,
    value: tokenData.access_token,
    ...COOKIE_OPTIONS(isProd),
    maxAge: tokenData.expires_in,
  });

  if (tokenData.refresh_token) {
    writer.set({
      name: COOKIE_NAMES.refreshToken,
      value: tokenData.refresh_token,
      ...COOKIE_OPTIONS(isProd),
    });
  }

  const expiresAt = Date.now() + tokenData.expires_in * 1000;
  writer.set({
    name: COOKIE_NAMES.expiresAt,
    value: String(expiresAt),
    ...COOKIE_OPTIONS(isProd),
  });
}

export function clearAuthCookiesOnResponse(writer: CookieWriter, isProd: boolean) {
  const names = Object.values(COOKIE_NAMES);
  for (const name of names) {
    writer.set({ name, value: "", ...COOKIE_OPTIONS(isProd), maxAge: 0 });
  }
}

export function clearTemporaryAuthCookiesOnResponse(writer: CookieWriter, isProd: boolean) {
  writer.set({ name: COOKIE_NAMES.authState, value: "", ...COOKIE_OPTIONS(isProd), maxAge: 0 });
  writer.set({ name: COOKIE_NAMES.codeVerifier, value: "", ...COOKIE_OPTIONS(isProd), maxAge: 0 });
}

