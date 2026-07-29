import { SPOTIFY_API_BASE } from "@/lib/spotify/constants";
import {
  CreateSpotifyPlaylistInput,
  SpotifyApiErrorCode,
  SpotifyCreatedPlaylist,
  SpotifyPlaylist,
  SpotifyProfile,
  SpotifyPlaylistsResponse,
  TrackSearchResult,
  SpotifySearchTracksResponse,
  ParsedTrackInput,
} from "@/lib/spotify/types";
import { validateSpotifyPlaylistId } from "@/lib/spotify/validation";

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

function buildSpotifyHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function parseSpotifyError(response: Response): Promise<{ status?: number; message?: string }> {
  try {
    const body = await response.json();
    const errorPayload = body && typeof body === "object" && "error" in body ? body.error : body;

    if (errorPayload && typeof errorPayload === "object") {
      const nested = errorPayload as { status?: number; message?: string };
      return {
        status: typeof nested.status === "number" ? nested.status : undefined,
        message: typeof nested.message === "string" ? nested.message : undefined,
      };
    }
  } catch {
    // Ignore parsing errors for non-JSON or empty error bodies.
  }

  return {};
}

export async function fetchSpotifyProfile(accessToken: string): Promise<SpotifyProfile> {
  const url = `${SPOTIFY_API_BASE}/me`;
  const res = await fetch(url, {
    headers: buildSpotifyHeaders(accessToken),
    cache: "no-store",
  });

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
  const res = await fetch(url, {
    headers: buildSpotifyHeaders(accessToken),
    cache: "no-store",
  });

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
    public: typeof input.public === "boolean" ? input.public : false,
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
        ...buildSpotifyHeaders(accessToken),
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
      const controlledCode =
        response.status === 400
          ? "invalid_playlist_data"
          : response.status === 401
          ? "unauthorized"
          : response.status === 403
          ? "forbidden"
          : response.status === 429
          ? "rate_limited"
          : "other";

      console.error("[spotify:create-playlist] request failed", {
        status: response.status,
        controlledCode,
      });

      const providerError = await parseSpotifyError(response);
      if (process.env.NODE_ENV === "development") {
        console.error("[spotify:create-playlist] provider response", {
          providerStatus: providerError.status,
          providerMessage: providerError.message?.slice(0, 200),
        });
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

    throw error;
  }
}

export async function removeSpotifyPlaylistFromLibrary(accessToken: string, playlistId: string): Promise<void> {
  if (!validateSpotifyPlaylistId(playlistId)) {
    throw new SpotifyApiError("invalid_playlist_id", "other", 400);
  }

  const playlistUri = `spotify:playlist:${playlistId}`;
  const url = new URL(`${SPOTIFY_API_BASE}/me/library`);
  url.searchParams.set("uris", playlistUri);

  const response = await fetch(url, {
    method: "DELETE",
    headers: buildSpotifyHeaders(accessToken),
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new SpotifyApiError("unauthorized", "unauthorized", 401);
  }
  if (response.status === 403) {
    throw new SpotifyApiError("forbidden", "forbidden", 403);
  }
  if (response.status === 404) {
    throw new SpotifyApiError("not_found", "other", 404);
  }
  if (response.status === 429) {
    throw new SpotifyApiError("rate_limited", "rate_limited", 429, parseRetryAfter(response.headers.get("Retry-After")));
  }
  if (!response.ok) {
    const providerError = await parseSpotifyError(response);
    const controlledCode =
      response.status === 400
        ? "invalid_playlist_id"
        : response.status === 401
        ? "unauthorized"
        : response.status === 403
        ? "forbidden"
        : response.status === 404
        ? "not_found"
        : response.status === 429
        ? "rate_limited"
        : "other";

    if (process.env.NODE_ENV === "development") {
      console.error("[spotify:remove-playlist] provider response", {
        status: response.status,
        controlledCode,
        providerStatus: providerError.status,
        providerMessage: providerError.message?.slice(0, 200),
      });
    }

    throw new SpotifyApiError(controlledCode, controlledCode, response.status);
  }
}

export async function fetchSpotifyPlaylistById(accessToken: string, playlistId: string): Promise<SpotifyPlaylist> {
  if (!validateSpotifyPlaylistId(playlistId)) {
    throw new SpotifyApiError("invalid_playlist_id", "other", 400);
  }

  const url = `${SPOTIFY_API_BASE}/playlists/${encodeURIComponent(playlistId)}`;
  const res = await fetch(url, {
    headers: buildSpotifyHeaders(accessToken),
    cache: "no-store",
  });

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

export async function searchSpotifyTracks(
  accessToken: string,
  parsedInputs: ParsedTrackInput[],
): Promise<TrackSearchResult[]> {
  const results: TrackSearchResult[] = [];

  for (const input of parsedInputs) {
    try {
      const query = input.artist ? `track:${input.title} artist:${input.artist}` : `track:${input.title}`;
      const url = new URL(`${SPOTIFY_API_BASE}/search`);
      url.searchParams.set("q", query);
      url.searchParams.set("type", "track");
      url.searchParams.set("limit", "5");

      const res = await fetch(url.toString(), {
        headers: buildSpotifyHeaders(accessToken),
        cache: "no-store",
      });

      if (res.status === 401) {
        throw new SpotifyApiError("unauthorized", "unauthorized", 401);
      }
      if (res.status === 429) {
        throw new SpotifyApiError("rate_limited", "rate_limited", 429, parseRetryAfter(res.headers.get("Retry-After")));
      }
      if (!res.ok) {
        results.push({
          input: input.original,
          found: false,
        });
        continue;
      }

      const data = (await res.json()) as SpotifySearchTracksResponse;
      const tracks = data?.tracks?.items || [];

      if (tracks.length === 0) {
        results.push({
          input: input.original,
          found: false,
        });
        continue;
      }

      const track = tracks[0];
      results.push({
        input: input.original,
        found: true,
        track: {
          id: track.id,
          uri: track.uri,
          name: track.name,
          artists: track.artists.map((a) => a.name),
          albumName: track.album.name,
          imageUrl: track.images?.[0]?.url,
        },
      });
    } catch (error) {
      if (error instanceof SpotifyApiError) {
        if (error.status === 401) {
          throw error;
        }
        if (error.status === 429) {
          throw error;
        }
      }

      results.push({
        input: input.original,
        found: false,
      });
    }
  }

  return results;
}

export async function addTracksToSpotifyPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[],
): Promise<void> {
  if (!validateSpotifyPlaylistId(playlistId)) {
    throw new SpotifyApiError("invalid_playlist_id", "other", 400);
  }

  if (trackUris.length === 0) {
    return;
  }

  // Remove duplicates and limit to 30
  const uniqueUris = Array.from(new Set(trackUris)).slice(0, 30);

  const url = `${SPOTIFY_API_BASE}/playlists/${encodeURIComponent(playlistId)}/items`;
  const payload = { uris: uniqueUris };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...buildSpotifyHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new SpotifyApiError("unauthorized", "unauthorized", 401);
  }
  if (response.status === 403) {
    throw new SpotifyApiError("forbidden", "forbidden", 403);
  }
  if (response.status === 404) {
    throw new SpotifyApiError("not_found", "other", 404);
  }
  if (response.status === 429) {
    throw new SpotifyApiError("rate_limited", "rate_limited", 429, parseRetryAfter(response.headers.get("Retry-After")));
  }
  if (!response.ok) {
    const providerError = await parseSpotifyError(response);
    const controlledCode =
      response.status === 400
        ? "invalid_playlist_data"
        : response.status === 401
        ? "unauthorized"
        : response.status === 403
        ? "forbidden"
        : response.status === 404
        ? "not_found"
        : response.status === 429
        ? "rate_limited"
        : "other";

    if (process.env.NODE_ENV === "development") {
      console.error("[spotify:add-tracks] provider response", {
        status: response.status,
        controlledCode,
        providerStatus: providerError.status,
        providerMessage: providerError.message?.slice(0, 200),
      });
    }

    throw new SpotifyApiError(controlledCode, controlledCode, response.status);
  }
}