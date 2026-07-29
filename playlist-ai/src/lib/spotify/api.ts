import { SPOTIFY_API_BASE } from "@/lib/spotify/constants";
import {
  CreateSpotifyPlaylistInput,
  SpotifyApiErrorCode,
  SpotifyCreatedPlaylist,
  SpotifyPlaylist,
  SpotifyProfile,
  SpotifyPlaylistsResponse,
} from "@/lib/spotify/types";

export class SpotifyApiError extends Error {
  code: SpotifyApiErrorCode;
  retryAfter?: number;
  status: number;

  constructor(message: string, code: SpotifyApiErrorCode, status: number, retryAfter?: number) {
    super(message);
    this.code = code;
    this.retryAfter = retryAfter;
    this.status = status;
  }
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function fetchSpotifyProfile(accessToken: string): Promise<SpotifyProfile> {
  const url = `${SPOTIFY_API_BASE}/me`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });

  if (res.status === 401) {
    throw new SpotifyApiError("unauthorized", "unauthorized", 401);
  }
  if (res.status === 403) {
    throw new SpotifyApiError("forbidden", "forbidden", 403);
  }
  if (res.status === 429) {
    throw new SpotifyApiError("rate_limited", "rate_limited", 429, parseRetryAfter(res.headers.get("Retry-After")));
  }
  if (!res.ok) {
    throw new SpotifyApiError("spotify_api_error", "other", res.status);
  }

  const data = (await res.json()) as SpotifyProfile;
  return data;
}

export async function fetchSpotifyPlaylists(accessToken: string, limit = 20, offset = 0): Promise<SpotifyPlaylistsResponse> {
  const url = `${SPOTIFY_API_BASE}/me/playlists?limit=${limit}&offset=${offset}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });

  if (res.status === 401) {
    throw new SpotifyApiError("unauthorized", "unauthorized", 401);
  }
  if (res.status === 403) {
    throw new SpotifyApiError("forbidden", "forbidden", 403);
  }
  if (res.status === 429) {
    throw new SpotifyApiError("rate_limited", "rate_limited", 429, parseRetryAfter(res.headers.get("Retry-After")));
  }
  if (!res.ok) {
    throw new SpotifyApiError("spotify_api_error", "other", res.status);
  }

  const data = (await res.json()) as SpotifyPlaylistsResponse;
  return data;
}

export async function createSpotifyPlaylist(
  accessToken: string,
  input: CreateSpotifyPlaylistInput,
): Promise<SpotifyCreatedPlaylist> {
  const url = `${SPOTIFY_API_BASE}/me/playlists`;
  const payload = {
    name: input.name,
    description: input.description ?? "",
    public: Boolean(input.public),
  };

  try {
    console.info("[spotify:create-playlist] phase", {
      phase: "before-fetch",
      endpoint: "me/playlists",
      isPublicBoolean: typeof input.public === "boolean",
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    console.info("[spotify:create-playlist] phase", {
      phase: "after-fetch",
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      const codigoControlado =
        response.status === 400
          ? "invalid_playlist_data"
          : response.status === 401
          ? "unauthorized"
          : response.status === 403
          ? "forbidden"
          : response.status === 429
          ? "rate_limited"
          : "other";

      try {
        console.error("[spotify:create-playlist] request failed", {
          status: response.status,
          statusText: response.statusText,
          controlledCode: codigoControlado,
          hasRetryAfter: response.headers.has("retry-after"),
        });
      } catch {
        // ignore logging failures
      }

      let providerStatus: number | undefined;
      let providerMessage: string | undefined;
      try {
        const body = await response.json();
        const err = body && (body.error ?? body);
        if (err && typeof err === "object") {
          if (typeof err.status === "number") providerStatus = err.status;
          if (typeof err.message === "string") providerMessage = err.message;
        }
      } catch {
        // ignore parse errors
      }

      try {
        console.error("[spotify:create-playlist] provider response", {
          providerStatus,
          providerMessage:
            process.env.NODE_ENV === "development" ? providerMessage?.slice(0, 200) : undefined,
        });
      } catch {
        // ignore
      }

      if (response.status === 401) {
        throw new SpotifyApiError("unauthorized", "unauthorized", 401);
      }
      if (response.status === 403) {
        throw new SpotifyApiError("forbidden", "forbidden", 403);
      }
      if (response.status === 429) {
        throw new SpotifyApiError(
          "rate_limited",
          "rate_limited",
          429,
          parseRetryAfter(response.headers.get("Retry-After")),
        );
      }
      if (response.status === 400) {
        throw new SpotifyApiError("invalid_playlist_data", "other", 400);
      }

      throw new SpotifyApiError("spotify_api_error", "other", response.status);
    }

    console.info("[spotify:create-playlist] phase", {
      phase: "before-response-json",
    });

    const data = await response.json();

    console.info("[spotify:create-playlist] phase", {
      phase: "after-response-json",
      hasId: typeof data === "object" && data !== null && "id" in data,
      hasName: typeof data === "object" && data !== null && "name" in data,
    });

    if (
      !data ||
      typeof data.id !== "string" ||
      data.id.length === 0 ||
      typeof data.name !== "string" ||
      data.name.length === 0
    ) {
      throw new SpotifyApiError("spotify_api_error", "other", 500);
    }

    console.info("[spotify:create-playlist] phase", {
      phase: "before-return",
    });

    return data as SpotifyCreatedPlaylist;
  } catch (error: unknown) {
    if (error instanceof SpotifyApiError) {
      throw error;
    }

    try {
      console.error("[spotify:create-playlist] unexpected error", {
        errorName: error instanceof Error ? error.name : "UnknownError",
        errorMessage:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message.slice(0, 300)
            : undefined,
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack?.split("\n").slice(0, 6).join("\n")
            : undefined,
      });
    } catch {
      // ignore logging failures
    }

    throw error;
  }
}

function validateSpotifyPlaylistId(playlistId: string): boolean {
  return typeof playlistId === "string" && playlistId.length > 0 && playlistId.length <= 100 && /^[A-Za-z0-9_-]+$/.test(playlistId);
}

export async function fetchSpotifyPlaylistById(accessToken: string, playlistId: string): Promise<SpotifyPlaylist> {
  if (!validateSpotifyPlaylistId(playlistId)) {
    throw new SpotifyApiError("invalid_playlist_id", "other", 400);
  }

  const url = `${SPOTIFY_API_BASE}/playlists/${encodeURIComponent(playlistId)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });

  if (res.status === 401) {
    throw new SpotifyApiError("unauthorized", "unauthorized", 401);
  }
  if (res.status === 403) {
    throw new SpotifyApiError("forbidden", "forbidden", 403);
  }
  if (res.status === 429) {
    throw new SpotifyApiError("rate_limited", "rate_limited", 429, parseRetryAfter(res.headers.get("Retry-After")));
  }
  if (res.status === 404) {
    throw new SpotifyApiError("not_found", "other", 404);
  }
  if (!res.ok) {
    throw new SpotifyApiError("spotify_api_error", "other", res.status);
  }

  const data = (await res.json()) as SpotifyPlaylist;
  if (!data || typeof data.id !== "string" || !data.owner || typeof data.owner.id !== "string") {
    throw new SpotifyApiError("spotify_api_error", "other", res.status);
  }

  return data;
}

