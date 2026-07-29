export const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export const SCOPES = [
  "user-read-private",
  "user-library-modify",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

export const TOKEN_EXPIRATION_MARGIN_MS = 60_000;

export const ALLOWED_REFRESH_RETURN_TO = ["/dashboard", "/playlists/new"] as const;

