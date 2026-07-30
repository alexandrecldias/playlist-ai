import type { GeneratePlaylistResponse, SuggestedSong } from "../types";

type RawSong = {
  title?: unknown;
  artist?: unknown;
};

type RawPlaylistResponse = {
  songs?: unknown;
};

export class ResponseParser {
  static parsePlaylist(payload: unknown, maxSongs: number): GeneratePlaylistResponse {
    if (!isObject(payload)) {
      throw new Error("AI returned an invalid payload.");
    }

    const response = payload as RawPlaylistResponse;
    if (!("songs" in response)) {
      throw new Error("Songs array not found.");
    }

    if (!Array.isArray(response.songs)) {
      throw new Error("Songs array not found.");
    }

    if (response.songs.length === 0) {
      throw new Error("Nenhuma música retornada.");
    }

    if (response.songs.length > maxSongs) {
      throw new Error("AI returned an invalid payload.");
    }

    const songs: SuggestedSong[] = [];
    const seen = new Set<string>();

    for (const item of response.songs) {
      const song = parseSong(item);
      const dedupeKey = `${song.title.toLowerCase()}::${song.artist.toLowerCase()}`;

      if (seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      songs.push(song);
    }

    if (songs.length === 0) {
      throw new Error("Nenhuma música retornada.");
    }

    return { songs };
  }

  static parse(payload: unknown, maxSongs: number): GeneratePlaylistResponse {
    return ResponseParser.parsePlaylist(payload, maxSongs);
  }
}

function parseSong(item: unknown): SuggestedSong {
  if (!isObject(item)) {
    throw new Error("Invalid song structure.");
  }

  const rawSong = item as RawSong;
  if (typeof rawSong.title !== "string" || typeof rawSong.artist !== "string") {
    throw new Error("Invalid song structure.");
  }

  const title = normalizeText(rawSong.title);
  const artist = normalizeText(rawSong.artist);

  if (!title || !artist) {
    throw new Error("Invalid song structure.");
  }

  return { title, artist };
}

function normalizeText(value: string): string {
  return value.trim().split(/\s+/).join(" ");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
