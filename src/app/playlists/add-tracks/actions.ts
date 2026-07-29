"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_NAMES, clearAuthCookiesOnResponse, setAuthTokenCookies } from "@/lib/spotify/cookies";
import {
  fetchSpotifyPlaylistById,
  fetchSpotifyProfile,
  addTracksToSpotifyPlaylist,
  searchSpotifyTracks,
  SpotifyApiError,
} from "@/lib/spotify";
import { getSpotifyAccessToken } from "@/lib/spotify/auth";
import { validateSpotifyPlaylistId } from "@/lib/spotify/validation";
import { ParsedTrackInput } from "@/lib/spotify/types";

export type AddTracksActionState =
  | { status: "idle" }
  | { status: "success"; message: string; added: number; notFound: number; deselected: number }
  | { status: "validation_error"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "api_error"; message: string };

export type SearchTracksActionState =
  | { status: "idle" }
  | { status: "success"; results: import("@/lib/spotify/types").TrackSearchResult[] }
  | { status: "error"; message: string };

function mapSpotifyErrorToState(error: unknown): AddTracksActionState {
  if (error instanceof SpotifyApiError) {
    if (error.status === 400 || error.code === "invalid_playlist_id" || error.code === "invalid_playlist_data") {
      return {
        status: "validation_error",
        message: "A playlist informada é inválida.",
      };
    }

    if (error.status === 401 || error.code === "unauthorized") {
      return {
        status: "api_error",
        message: "Sua sessão expirou. Entre novamente.",
      };
    }

    if (error.status === 403 || error.code === "forbidden") {
      return {
        status: "forbidden",
        message:
          "O Spotify não permitiu adicionar músicas a esta playlist. Verifique as permissões da sua conta.",
      };
    }

    if (error.status === 404 || error.code === "not_found") {
      return {
        status: "api_error",
        message: "A playlist não foi encontrada.",
      };
    }

    if (error.status === 429 || error.code === "rate_limited") {
      return {
        status: "api_error",
        message: "O Spotify limitou temporariamente as solicitações. Aguarde um pouco e tente novamente.",
      };
    }
  }

  return {
    status: "api_error",
    message: "Não foi possível adicionar as músicas.",
  };
}

export async function searchTracksAction(
  _previousState: SearchTracksActionState,
  formData: FormData,
): Promise<SearchTracksActionState> {
  const rawParsedInput = formData.get("parsedInput");

  if (!rawParsedInput || typeof rawParsedInput !== "string") {
    return {
      status: "error",
      message: "Entrada inválida.",
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  const isProd = process.env.NODE_ENV === "production";

  if (!accessToken) {
    return {
      status: "error",
      message: "Sua sessão expirou. Entre novamente.",
    };
  }

  try {
    const parsed: ParsedTrackInput[] = JSON.parse(rawParsedInput);
    const results = await searchSpotifyTracks(accessToken, parsed);

    return {
      status: "success",
      results,
    };
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 401 && refreshToken) {
      try {
        const refreshedToken = await getSpotifyAccessToken(undefined, refreshToken, undefined, true);
        const results = await searchSpotifyTracks(refreshedToken.accessToken, JSON.parse(rawParsedInput));

        if (refreshedToken.tokenData) {
          setAuthTokenCookies(cookieStore, refreshedToken.tokenData, isProd);
        }

        return {
          status: "success",
          results,
        };
      } catch {
        return {
          status: "error",
          message: "Sua sessão expirou. Entre novamente.",
        };
      }
    }

    if (error instanceof SpotifyApiError) {
      if (error.status === 429) {
        return {
          status: "error",
          message: "O Spotify limitou temporariamente as solicitações. Aguarde um pouco e tente novamente.",
        };
      }
    }

    return {
      status: "error",
      message: "Erro ao pesquisar músicas.",
    };
  }
}

export async function addTracksAction(
  _previousState: AddTracksActionState,
  formData: FormData,
): Promise<AddTracksActionState> {
  const rawPlaylistId = formData.get("playlistId");
  const rawTrackUris = formData.get("trackUris");
  const rawNotFoundCount = formData.get("notFoundCount");
  const rawDeselectedCount = formData.get("deselectedCount");

  const playlistId = typeof rawPlaylistId === "string" ? rawPlaylistId.trim() : "";
  const trackUrisString = typeof rawTrackUris === "string" ? rawTrackUris : "";
  const notFoundCount = typeof rawNotFoundCount === "string" ? parseInt(rawNotFoundCount, 10) : 0;
  const deselectedCount = typeof rawDeselectedCount === "string" ? parseInt(rawDeselectedCount, 10) : 0;

  if (!validateSpotifyPlaylistId(playlistId)) {
    return {
      status: "validation_error",
      message: "A playlist informada é inválida.",
    };
  }

  const trackUris = trackUrisString
    .split(",")
    .map((uri) => uri.trim())
    .filter((uri) => uri.length > 0);

  if (trackUris.length === 0) {
    return {
      status: "validation_error",
      message: "Nenhuma música foi selecionada.",
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  const isProd = process.env.NODE_ENV === "production";

  let currentAccessToken = accessToken;
  let currentRefreshToken = refreshToken;

  try {
    if (!currentAccessToken) {
      return {
        status: "api_error",
        message: "Sua sessão expirou. Entre novamente.",
      };
    }

    // Fetch playlist and profile to validate ownership
    const [playlist, profile] = await Promise.all([
      fetchSpotifyPlaylistById(currentAccessToken, playlistId),
      fetchSpotifyProfile(currentAccessToken),
    ]);

    if (playlist.owner.id !== profile.id) {
      return {
        status: "forbidden",
        message: "Você só pode adicionar músicas a playlists criadas pela sua conta.",
      };
    }

    // Attempt to add tracks
    await addTracksToSpotifyPlaylist(currentAccessToken, playlistId, trackUris);
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 401 && currentRefreshToken) {
      try {
        const refreshedToken = await getSpotifyAccessToken(undefined, currentRefreshToken, undefined, true);
        currentAccessToken = refreshedToken.accessToken;
        currentRefreshToken = refreshedToken.refreshToken;

        if (refreshedToken.tokenData) {
          setAuthTokenCookies(cookieStore, refreshedToken.tokenData, isProd);
        }

        // Retry add tracks operation
        const [playlist, profile] = await Promise.all([
          fetchSpotifyPlaylistById(currentAccessToken, playlistId),
          fetchSpotifyProfile(currentAccessToken),
        ]);

        if (playlist.owner.id !== profile.id) {
          return {
            status: "forbidden",
            message: "Você só pode adicionar músicas a playlists criadas pela sua conta.",
          };
        }

        await addTracksToSpotifyPlaylist(currentAccessToken, playlistId, trackUris);
      } catch (retryError) {
        if (retryError instanceof SpotifyApiError && retryError.status === 401) {
          clearAuthCookiesOnResponse(cookieStore, isProd);
          return {
            status: "api_error",
            message: "Sua sessão expirou. Entre novamente.",
          };
        }

        return mapSpotifyErrorToState(retryError);
      }
    } else {
      return mapSpotifyErrorToState(error);
    }
  }

  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `${trackUris.length} músicas adicionadas à playlist.`,
    added: trackUris.length,
    notFound: notFoundCount,
    deselected: deselectedCount,
  };
}
