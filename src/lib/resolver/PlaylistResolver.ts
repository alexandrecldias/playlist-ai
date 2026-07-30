import { searchSpotifyTrackCandidates } from "../spotify/api.ts";
import type { GeneratePlaylistResponse, SuggestedSong } from "../ai/types.ts";
import type { SpotifyTrack } from "../spotify/types.ts";
import type { ResolvedPlaylist, ResolvedTrack, ResolvedTrackStatus } from "./types";

type SearchSpotifyTrackCandidates = typeof searchSpotifyTrackCandidates;

type ResolutionCacheEntry = Promise<ResolvedTrack>;

export class PlaylistResolver {
  private readonly cache = new Map<string, ResolutionCacheEntry>();
  private readonly accessToken: string;
  private readonly searchTracks: SearchSpotifyTrackCandidates;

  constructor(accessToken: string, searchTracks: SearchSpotifyTrackCandidates = searchSpotifyTrackCandidates) {
    this.accessToken = accessToken;
    this.searchTracks = searchTracks;
  }

  async resolvePlaylist(response: GeneratePlaylistResponse): Promise<ResolvedPlaylist> {
    logResolver("Starting resolution", { totalSongs: response.songs.length });

    const resolvedTracks = await Promise.all(response.songs.map((song) => this.resolveTrack(song)));
    const summary = buildSummary(resolvedTracks);

    logResolver("Finished", {
      total: summary.total,
      foundCount: summary.foundCount,
      notFoundCount: summary.notFoundCount,
      multipleMatchesCount: summary.multipleMatchesCount,
      errorCount: summary.errorCount,
      successRate: summary.successRate,
    });

    return summary;
  }

  private resolveTrack(song: SuggestedSong): Promise<ResolvedTrack> {
    const key = buildCacheKey(song.title, song.artist);
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const task = this.resolveTrackInternal(song).catch((error: unknown) => {
      logResolverError("Track resolution failed", song, error);
      return buildResolvedTrack(song.title, song.artist, "ERROR");
    });

    this.cache.set(key, task);
    return task;
  }

  private async resolveTrackInternal(song: SuggestedSong): Promise<ResolvedTrack> {
    logResolver("Searching", { title: song.title, artist: song.artist });

    const candidates = await this.searchTracks(this.accessToken, song.title, song.artist);
    const resolved = selectBestTrack(song, candidates);

    if (resolved.status === "NOT_FOUND") {
      logResolver("Not Found", { title: song.title, artist: song.artist });
      return resolved;
    }

    if (resolved.multipleMatches) {
      logResolver("Multiple matches", { title: song.title, artist: song.artist, candidates: candidates.length });
    }

    logResolver("Found", { title: song.title, artist: song.artist });
    return resolved;
  }
}

function buildSummary(tracks: ResolvedTrack[]): ResolvedPlaylist {
  const foundCount = tracks.filter((track) => track.found).length;
  const notFoundCount = tracks.filter((track) => track.status === "NOT_FOUND").length;
  const multipleMatchesCount = tracks.filter((track) => track.multipleMatches).length;
  const errorCount = tracks.filter((track) => track.status === "ERROR").length;
  const total = tracks.length;
  const successRate = total === 0 ? 0 : Math.round((foundCount / total) * 100);

  return {
    total,
    foundCount,
    notFoundCount,
    multipleMatchesCount,
    errorCount,
    successRate,
    tracks,
  };
}

function selectBestTrack(song: SuggestedSong, candidates: SpotifyTrack[]): ResolvedTrack {
  if (candidates.length === 0) {
    return buildResolvedTrack(song.title, song.artist, "NOT_FOUND");
  }

  return toResolvedTrack(song.title, song.artist, candidates[0], candidates.length > 1);
}

function toResolvedTrack(
  title: string,
  artist: string,
  track: SpotifyTrack,
  multipleMatches: boolean,
): ResolvedTrack {
  return {
    title,
    artist,
    found: true,
    status: "FOUND",
    multipleMatches,
    spotifyId: track.id,
    spotifyUri: track.uri,
    album: track.album?.name,
    albumImage: track.album?.images?.[0]?.url ?? track.images?.[0]?.url,
    previewUrl: track.preview_url ?? null,
    durationMs: track.duration_ms,
    popularity: track.popularity,
    externalUrl: track.external_urls?.spotify,
  };
}

function buildResolvedTrack(title: string, artist: string, status: ResolvedTrackStatus): ResolvedTrack {
  return {
    title,
    artist,
    found: false,
    status,
  };
}

function buildCacheKey(title: string, artist: string): string {
  return `${normalize(title)}::${normalize(artist)}`;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function logResolver(message: string, details?: Record<string, unknown>): void {
  if (details) {
    console.info(`[Resolver] ${message}`, details);
    return;
  }

  console.info(`[Resolver] ${message}`);
}

function logResolverError(message: string, song: SuggestedSong, error: unknown): void {
  console.error(`[Resolver] ${message}`, {
    title: song.title,
    artist: song.artist,
    errorName: error instanceof Error ? error.name : "UnknownError",
    errorMessage: error instanceof Error ? error.message.slice(0, 200) : undefined,
  });
}
