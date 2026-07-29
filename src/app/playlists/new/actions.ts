"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CreateSpotifyPlaylistInput, SpotifyApiError, isTokenExpiring } from "@/lib/spotify";
import { COOKIE_NAMES, clearAuthCookiesOnResponse, setAuthTokenCookies } from "@/lib/spotify/cookies";
import { createSpotifyPlaylist } from "@/lib/spotify/api";
import { getSpotifyAccessToken } from "@/lib/spotify/auth";

export type CreatePlaylistActionState =
  | {
      status: "idle";
    }
  | {
      status: "validation_error";
      fieldErrors: {
        name?: string;
        description?: string;
      };
      values: {
        name: string;
        description: string;
        visibility: "private" | "public";
      };
    }
  | {
      status: "api_error";
      message: string;
      values: {
        name: string;
        description: string;
        visibility: "private" | "public";
      };
    };

type VisibilityValue = "private" | "public";

type ActionValues = {
  name: string;
  description: string;
  visibility: VisibilityValue;
};

function parseVisibility(value: FormDataEntryValue | null): VisibilityValue {
  if (value === "public") {
    return "public";
  }
  return "private";
}

function buildActionValues(formData: FormData): ActionValues {
  const rawName = formData.get("name");
  const rawDescription = formData.get("description");
  const rawVisibility = formData.get("visibility");

  return {
    name: typeof rawName === "string" ? rawName.trim() : "",
    description: typeof rawDescription === "string" ? rawDescription.trim() : "",
    visibility: parseVisibility(rawVisibility),
  };
}

function validateValues(values: ActionValues) {
  const fieldErrors: { name?: string; description?: string } = {};

  if (!values.name || values.name.length === 0) {
    fieldErrors.name = "O nome da playlist Ã© obrigatÃ³rio.";
  } else if (values.name.length > 100) {
    fieldErrors.name = "O nome da playlist nÃ£o pode ultrapassar 100 caracteres.";
  }

  if (values.description.length > 300) {
    fieldErrors.description = "A descriÃ§Ã£o nÃ£o pode ultrapassar 300 caracteres.";
  }

  return fieldErrors;
}

export async function createPlaylistAction(
  _currentState: void | CreatePlaylistActionState,
  formData: FormData,
): Promise<CreatePlaylistActionState | void> {
  const values = buildActionValues(formData);
  const fieldErrors = validateValues(values);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation_error",
      fieldErrors,
      values,
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  const expiresAt = cookieStore.get(COOKIE_NAMES.expiresAt)?.value;
  const expiresAtMs = expiresAt ? Number(expiresAt) : undefined;
  const isProd = process.env.NODE_ENV === "production";

  // Diagnostic: authentication presence and expiry
  const tokenConsideredExpired = isTokenExpiring(expiresAtMs);
  try {
    console.info("[createPlaylistAction] authentication", {
      hasAccessToken: Boolean(accessToken),
      hasRefreshToken: Boolean(refreshToken),
      hasExpiresAt: Boolean(expiresAt),
      tokenConsideredExpired,
    });
  } catch {
    /* ignore */
  }

  let tokenResult;
  try {
    tokenResult = await getSpotifyAccessToken(accessToken, refreshToken, expiresAtMs);
  } catch {
    // unable to obtain a valid token server-side
    clearAuthCookiesOnResponse(cookieStore, isProd);
    return {
      status: "api_error",
      message: "Sua sessÃ£o expirou. Saia e entre novamente.",
      values,
    };
  }

  if (tokenResult.refreshed && tokenResult.tokenData) {
    setAuthTokenCookies(cookieStore, tokenResult.tokenData, isProd);
  }

  const playlistInput: CreateSpotifyPlaylistInput = {
    name: values.name,
    description: values.description,
    public: values.visibility === "public",
  };

  let attempts = 0;
  let currentAccessToken = tokenResult.accessToken;
  let currentRefreshToken = tokenResult.refreshToken;

  let refreshAttempted = false;
  let createdPlaylist: { id: string } | undefined;
  while (attempts < 2) {
    try {
      const attemptNumber = attempts + 1;
      try {
        console.info("[createPlaylistAction] create attempt", {
          attempt: attemptNumber,
          visibility: playlistInput.public ? "public" : "private",
        });
      } catch {}

      createdPlaylist = await createSpotifyPlaylist(currentAccessToken, playlistInput);
      break;
    } catch (error) {
      attempts += 1;
      const creationAttempt = attempts;

      if (error instanceof SpotifyApiError && error.code === "unauthorized" && attempts === 1) {
        refreshAttempted = true;
        if (!currentRefreshToken) {
          clearAuthCookiesOnResponse(cookieStore, isProd);
          return {
            status: "api_error",
            message: "Sua sessão expirou. Saia e entre novamente.",
            values,
          };
        }

        try {
          const refreshed = await getSpotifyAccessToken(undefined, currentRefreshToken, undefined, true);
          if (refreshed.refreshed && refreshed.tokenData) {
            setAuthTokenCookies(cookieStore, refreshed.tokenData, isProd);
          }
          currentAccessToken = refreshed.accessToken;
          currentRefreshToken = refreshed.refreshToken;
          continue;
        } catch (refreshErr) {
          clearAuthCookiesOnResponse(cookieStore, isProd);
          try {
            console.error("[createPlaylistAction]", {
              errorName: refreshErr instanceof Error ? refreshErr.name : "UnknownError",
              errorCode: refreshErr instanceof SpotifyApiError ? refreshErr.code : undefined,
              errorStatus: refreshErr instanceof SpotifyApiError ? refreshErr.status : undefined,
              refreshAttempted,
              creationAttempt,
              errorMessage:
                process.env.NODE_ENV === "development" && refreshErr instanceof Error
                  ? refreshErr.message.slice(0, 300)
                  : undefined,
              stack:
                process.env.NODE_ENV === "development" && refreshErr instanceof Error
                  ? refreshErr.stack?.split("\n").slice(0, 6).join("\n")
                  : undefined,
            });
          } catch {}

          return {
            status: "api_error",
            message: "Sua sessão expirou. Saia e entre novamente.",
            values,
          };
        }
      }

      try {
        console.error("[createPlaylistAction]", {
          errorName: error instanceof Error ? error.name : "UnknownError",
          errorCode: error instanceof SpotifyApiError ? error.code : undefined,
          errorStatus: error instanceof SpotifyApiError ? error.status : undefined,
          refreshAttempted,
          creationAttempt,
          errorMessage:
            process.env.NODE_ENV === "development" && error instanceof Error
              ? error.message.slice(0, 300)
              : undefined,
          stack:
            process.env.NODE_ENV === "development" && error instanceof Error
              ? error.stack?.split("\n").slice(0, 6).join("\n")
              : undefined,
        });
      } catch {}

      if (error instanceof SpotifyApiError) {
        if (error.status === 400 || error.code === "other") {
          return {
            status: "api_error",
            message: "Os dados da playlist não foram aceitos pelo Spotify.",
            values,
          };
        }
        if (error.status === 401 || error.code === "unauthorized") {
          clearAuthCookiesOnResponse(cookieStore, isProd);
          return {
            status: "api_error",
            message: "Sua sessão expirou. Saia e entre novamente.",
            values,
          };
        }
        if (error.status === 403 || error.code === "forbidden") {
          return {
            status: "api_error",
            message: "A autorização atual não permite criar playlists. Saia e entre novamente para renovar as permissões.",
            values,
          };
        }
        if (error.status === 429 || error.code === "rate_limited") {
          return {
            status: "api_error",
            message: "O Spotify limitou temporariamente as solicitações. Aguarde um pouco e tente novamente.",
            values,
          };
        }
      }

      return {
        status: "api_error",
        message: "Não foi possível criar a playlist. Tente novamente mais tarde.",
        values,
      };
    }
  }

  if (createdPlaylist) {
    revalidatePath("/dashboard");
    redirect(`/playlists/${encodeURIComponent(createdPlaylist.id)}/created`);
  }

  return {
    status: "api_error",
    message: "Não foi possível criar a playlist. Tente novamente mais tarde.",
    values,
  };
}
