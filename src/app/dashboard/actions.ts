"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_NAMES, clearAuthCookiesOnResponse, setAuthTokenCookies } from "@/lib/spotify/cookies";
import {
  fetchSpotifyPlaylistById,
  fetchSpotifyProfile,
  removeSpotifyPlaylistFromLibrary,
  SpotifyApiError,
} from "@/lib/spotify";
import { getSpotifyAccessToken } from "@/lib/spotify/auth";
import { validateSpotifyPlaylistId } from "@/lib/spotify/validation";

export type RemovePlaylistActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "validation_error"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "api_error"; message: string };

function mapSpotifyErrorToState(error: unknown): RemovePlaylistActionState {
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
        message: "Você só pode remover playlists criadas pela sua conta.",
      };
    }

    if (error.status === 404 || error.code === "not_found") {
      return {
        status: "api_error",
        message: "A playlist não foi encontrada ou já foi removida.",
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
    message: "Não foi possível remover a playlist.",
  };
}

export async function removePlaylistAction(
  _previousState: RemovePlaylistActionState,
  formData: FormData,
): Promise<RemovePlaylistActionState> {
  const rawPlaylistId = formData.get("playlistId");
  const playlistId = typeof rawPlaylistId === "string" ? rawPlaylistId.trim() : "";

  if (!validateSpotifyPlaylistId(playlistId)) {
    return {
      status: "validation_error",
      message: "A playlist informada é inválida.",
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  const expiresAt = cookieStore.get(COOKIE_NAMES.expiresAt)?.value;
  const expiresAtMs = expiresAt ? Number(expiresAt) : undefined;
  const isProd = process.env.NODE_ENV === "production";

  let currentAccessToken = accessToken;
  let currentRefreshToken = refreshToken;

  try {
    const tokenResult = await getSpotifyAccessToken(currentAccessToken, currentRefreshToken, expiresAtMs);
    currentAccessToken = tokenResult.accessToken;
    currentRefreshToken = tokenResult.refreshToken;

    if (tokenResult.refreshed && tokenResult.tokenData) {
      setAuthTokenCookies(cookieStore, tokenResult.tokenData, isProd);
    }

    const profile = await fetchSpotifyProfile(currentAccessToken);
    const playlist = await fetchSpotifyPlaylistById(currentAccessToken, playlistId);

    if (playlist.owner.id !== profile.id) {
      return {
        status: "forbidden",
        message: "Você só pode remover playlists criadas pela sua conta.",
      };
    }

    await removeSpotifyPlaylistFromLibrary(currentAccessToken, playlistId);
    revalidatePath("/dashboard");

    return {
      status: "success",
      message: "Playlist removida da sua biblioteca.",
    };
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 401 && currentRefreshToken) {
      try {
        const refreshedToken = await getSpotifyAccessToken(undefined, currentRefreshToken, undefined, true);
        currentAccessToken = refreshedToken.accessToken;
        currentRefreshToken = refreshedToken.refreshToken;

        if (refreshedToken.refreshed && refreshedToken.tokenData) {
          setAuthTokenCookies(cookieStore, refreshedToken.tokenData, isProd);
        }

        const profile = await fetchSpotifyProfile(currentAccessToken);
        const playlist = await fetchSpotifyPlaylistById(currentAccessToken, playlistId);

        if (playlist.owner.id !== profile.id) {
          return {
            status: "forbidden",
            message: "Você só pode remover playlists criadas pela sua conta.",
          };
        }

        await removeSpotifyPlaylistFromLibrary(currentAccessToken, playlistId);
        revalidatePath("/dashboard");

        return {
          status: "success",
          message: "Playlist removida da sua biblioteca.",
        };
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
    }

    return mapSpotifyErrorToState(error);
  }
}
