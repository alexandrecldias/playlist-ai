"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { AIService, AI_CONFIG } from "@/lib/ai";
import { PlaylistResolver, type ResolvedPlaylist } from "@/lib/resolver";
import {
  COOKIE_NAMES,
  addTracksToSpotifyPlaylist,
  createSpotifyPlaylist,
  clearAuthCookiesOnResponse,
  getSpotifyAccessToken,
  PlaylistCreationResult,
  SpotifyApiError,
  setAuthTokenCookies,
} from "@/lib/spotify";
import type { PlaylistCreationRequest } from "./types";

export type AiPlaylistActionState =
  | {
      status: "idle";
    }
  | {
      status: "validation_error";
      message: string;
      prompt: string;
    }
  | {
      status: "success";
      prompt: string;
      playlist: ResolvedPlaylist;
    }
  | {
      status: "error";
      message: string;
      prompt: string;
    };

export type PlaylistCreationActionState =
  | {
      status: "idle";
    }
  | {
      status: "success";
      result: PlaylistCreationResult;
    }
  | {
      status: "validation_error";
      message: string;
    }
  | {
      status: "api_error";
      message: string;
    };

function normalizePrompt(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function buildInvalidPromptMessage(): string {
  return "Digite um prompt válido para gerar a playlist.";
}

function buildPromptTooLongMessage(): string {
  return `O prompt não pode ultrapassar ${AI_CONFIG.maxPromptChars} caracteres.`;
}

export async function generateAiPlaylistAction(
  _currentState: AiPlaylistActionState,
  formData: FormData,
): Promise<AiPlaylistActionState> {
  const rawPrompt = formData.get("prompt");
  const prompt = typeof rawPrompt === "string" ? normalizePrompt(rawPrompt) : "";

  if (!prompt) {
    return {
      status: "validation_error",
      message: buildInvalidPromptMessage(),
      prompt: "",
    };
  }

  if (prompt.length > AI_CONFIG.maxPromptChars) {
    return {
      status: "validation_error",
      message: buildPromptTooLongMessage(),
      prompt,
    };
  }

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
    const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
    const expiresAt = cookieStore.get(COOKIE_NAMES.expiresAt)?.value;
    const expiresAtMs = expiresAt ? Number(expiresAt) : undefined;
    const isProd = process.env.NODE_ENV === "production";

    const tokenResult = await getSpotifyAccessToken(accessToken, refreshToken, expiresAtMs);
    if (tokenResult.refreshed && tokenResult.tokenData) {
      setAuthTokenCookies(cookieStore, tokenResult.tokenData, isProd);
    }

    const service = new AIService();
    const generated = await service.generatePlaylist({
      prompt,
      maxSongs: AI_CONFIG.maxSongs,
    });

    const resolver = new PlaylistResolver(tokenResult.accessToken);
    const playlist = await resolver.resolvePlaylist(generated);

    return {
      status: "success",
      prompt,
      playlist,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "refresh_missing") {
      return {
        status: "error",
        message: "Faça login com Spotify para resolver a playlist.",
        prompt,
      };
    }

    if (error instanceof Error && error.message === "ai_disabled") {
      return {
        status: "error",
        message: "A geração de playlists ainda não está configurada neste ambiente.",
        prompt,
      };
    }

    if (error instanceof Error && error.message === "Missing environment variable: GEMINI_API_KEY") {
      return {
        status: "error",
        message: "A chave do Gemini não está configurada no servidor.",
        prompt,
      };
    }

    return {
      status: "error",
      message: "Não foi possível gerar sua playlist. Tente novamente em alguns instantes.",
      prompt,
    };
  }
}

export async function createSpotifyPlaylistAction(
  _currentState: PlaylistCreationActionState,
  formData: FormData,
): Promise<PlaylistCreationActionState> {
  const rawName = formData.get("name");
  const rawDescription = formData.get("description");
  const rawPlaylist = formData.get("playlist");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const description = typeof rawDescription === "string" ? rawDescription.trim() : "";
  const playlist = parseResolvedPlaylist(rawPlaylist);

  if (!name) {
    return {
      status: "validation_error",
      message: "Informe um nome para a playlist.",
    };
  }

  if (name.length > 100) {
    return {
      status: "validation_error",
      message: "O nome da playlist não pode ultrapassar 100 caracteres.",
    };
  }

  if (description.length > 300) {
    return {
      status: "validation_error",
      message: "A descrição não pode ultrapassar 300 caracteres.",
    };
  }

  if (!playlist) {
    return {
      status: "validation_error",
      message: "A playlist resolvida é inválida.",
    };
  }

  const foundTracks = playlist.tracks.filter((track) => track.status === "FOUND" && typeof track.spotifyUri === "string" && track.spotifyUri.length > 0);
  const uniqueTrackUris = Array.from(new Set(foundTracks.map((track) => track.spotifyUri as string)));

  if (uniqueTrackUris.length === 0) {
    return {
      status: "validation_error",
      message: "É necessário ter ao menos uma música encontrada para criar a playlist.",
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  const expiresAt = cookieStore.get(COOKIE_NAMES.expiresAt)?.value;
  const expiresAtMs = expiresAt ? Number(expiresAt) : undefined;
  const isProd = process.env.NODE_ENV === "production";

  if (!accessToken) {
    return {
      status: "api_error",
      message: "Sua sessão expirou. Entre novamente.",
    };
  }

  let tokenResult: Awaited<ReturnType<typeof getSpotifyAccessToken>>;
  try {
    tokenResult = await getSpotifyAccessToken(accessToken, refreshToken, expiresAtMs);
  } catch {
    clearAuthCookiesOnResponse(cookieStore, isProd);
    return {
      status: "api_error",
      message: "Sua sessão expirou. Entre novamente.",
    };
  }

  if (tokenResult.refreshed && tokenResult.tokenData) {
    setAuthTokenCookies(cookieStore, tokenResult.tokenData, isProd);
  }

  const playlistRequest: PlaylistCreationRequest = {
    name,
    description,
    playlist,
  };

  try {
    const result = await createPlaylistWithTracks(tokenResult.accessToken, playlistRequest, uniqueTrackUris, cookieStore, isProd, tokenResult.refreshToken);
    revalidatePath("/dashboard");
    return {
      status: "success",
      result,
    };
  } catch (error: unknown) {
    if (error instanceof SpotifyApiError && error.status === 401) {
      clearAuthCookiesOnResponse(cookieStore, isProd);
      return {
        status: "api_error",
        message: "Sua sessão expirou. Entre novamente.",
      };
    }

    if (error instanceof SpotifyApiError && error.status === 403) {
      return {
        status: "api_error",
        message: "O Spotify não permitiu concluir esta ação.",
      };
    }

    if (error instanceof SpotifyApiError && error.status === 429) {
      return {
        status: "api_error",
        message: "O Spotify limitou temporariamente as solicitações. Tente novamente em instantes.",
      };
    }

    return {
      status: "api_error",
      message: "Falha ao criar playlist.",
    };
  }
}

function parseResolvedPlaylist(value: FormDataEntryValue | null): ResolvedPlaylist | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isResolvedPlaylist(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isResolvedPlaylist(value: unknown): value is ResolvedPlaylist {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const playlist = value as ResolvedPlaylist;
  return Array.isArray(playlist.tracks) && typeof playlist.total === "number";
}

async function createPlaylistWithTracks(
  accessToken: string,
  request: PlaylistCreationRequest,
  trackUris: string[],
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  isProd: boolean,
  refreshToken?: string,
): Promise<PlaylistCreationResult> {
  let createdPlaylist: Awaited<ReturnType<typeof createSpotifyPlaylist>>;
  try {
    createdPlaylist = await createSpotifyPlaylist(accessToken, {
      name: request.name,
      description: request.description,
      public: false,
    });
  } catch (error: unknown) {
    if (error instanceof SpotifyApiError && error.status === 401 && refreshToken) {
      try {
        const refreshedToken = await getSpotifyAccessToken(undefined, refreshToken, undefined, true);
        if (refreshedToken.tokenData) {
          setAuthTokenCookies(cookieStore, refreshedToken.tokenData, isProd);
        }

        createdPlaylist = await createSpotifyPlaylist(refreshedToken.accessToken, {
          name: request.name,
          description: request.description,
          public: false,
        });
      } catch (retryError: unknown) {
        console.error("[Playlist] Failed to create playlist", {
          errorName: retryError instanceof Error ? retryError.name : "UnknownError",
          errorCode: retryError instanceof SpotifyApiError ? retryError.code : undefined,
          errorStatus: retryError instanceof SpotifyApiError ? retryError.status : undefined,
          errorMessage: retryError instanceof Error ? retryError.message.slice(0, 200) : undefined,
        });
        throw retryError;
      }
    } else {
      console.error("[Playlist] Failed to create playlist", {
        errorName: error instanceof Error ? error.name : "UnknownError",
        errorCode: error instanceof SpotifyApiError ? error.code : undefined,
        errorStatus: error instanceof SpotifyApiError ? error.status : undefined,
        errorMessage: error instanceof Error ? error.message.slice(0, 200) : undefined,
      });
      throw error;
    }
  }

  try {
    await addTracksToSpotifyPlaylist(accessToken, createdPlaylist.id, trackUris);
  } catch (error: unknown) {
    if (error instanceof SpotifyApiError && error.status === 401 && refreshToken) {
      try {
        const refreshedToken = await getSpotifyAccessToken(undefined, refreshToken, undefined, true);
        if (refreshedToken.tokenData) {
          setAuthTokenCookies(cookieStore, refreshedToken.tokenData, isProd);
        }

        await addTracksToSpotifyPlaylist(refreshedToken.accessToken, createdPlaylist.id, trackUris);
      } catch (retryError: unknown) {
        console.error("[Playlist] Failed to add tracks", {
          playlistId: createdPlaylist.id,
          errorName: retryError instanceof Error ? retryError.name : "UnknownError",
          errorCode: retryError instanceof SpotifyApiError ? retryError.code : undefined,
          errorStatus: retryError instanceof SpotifyApiError ? retryError.status : undefined,
          errorMessage: retryError instanceof Error ? retryError.message.slice(0, 200) : undefined,
        });
        throw retryError;
      }
    } else {
      console.error("[Playlist] Failed to add tracks", {
        playlistId: createdPlaylist.id,
        errorName: error instanceof Error ? error.name : "UnknownError",
        errorCode: error instanceof SpotifyApiError ? error.code : undefined,
        errorStatus: error instanceof SpotifyApiError ? error.status : undefined,
        errorMessage: error instanceof Error ? error.message.slice(0, 200) : undefined,
      });
      throw error;
    }
  }

  const playlistUrl = createdPlaylist.external_urls?.spotify ?? `https://open.spotify.com/playlist/${createdPlaylist.id}`;

  return {
    playlistId: createdPlaylist.id,
    playlistUrl,
    playlistName: createdPlaylist.name,
    tracksAdded: trackUris.length,
    tracksIgnored: request.playlist.tracks.length - trackUris.length,
    success: true,
  };
}
