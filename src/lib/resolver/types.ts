export type ResolvedTrackStatus = "FOUND" | "NOT_FOUND" | "ERROR";

export type ResolvedTrack = {
  title: string;
  artist: string;
  found: boolean;
  status: ResolvedTrackStatus;
  multipleMatches?: boolean;
  spotifyId?: string;
  spotifyUri?: string;
  album?: string;
  albumImage?: string;
  previewUrl?: string | null;
  durationMs?: number;
  popularity?: number;
  externalUrl?: string;
};

export type ResolvedPlaylist = {
  total: number;
  foundCount: number;
  notFoundCount: number;
  multipleMatchesCount: number;
  errorCount: number;
  successRate: number;
  tracks: ResolvedTrack[];
};
