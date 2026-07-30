export type SpotifyTokenSuccess = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

export type SpotifyTokenError = {
  error: string;
  error_description?: string;
};

export type SpotifyImage = {
  url: string;
  height?: number;
  width?: number;
};

export type SpotifyExternalUrls = {
  spotify?: string;
};

export type SpotifyProfile = {
  id: string;
  display_name?: string | null;
  external_urls?: SpotifyExternalUrls;
  images?: SpotifyImage[];
};

export type PlaylistTracks = {
  total?: number | null;
};

export type SpotifyPlaylistItem = {
  id: string;
  name: string;
  description?: string | null;
  images?: { url: string }[];
  tracks?: PlaylistTracks;
  public?: boolean | null;
  external_urls?: SpotifyExternalUrls;
  owner: SpotifyPlaylistOwner;
};

export type SpotifyPlaylistsResponse = {
  items: SpotifyPlaylistItem[];
  limit: number;
  offset: number;
  total: number;
};

export type CreateSpotifyPlaylistInput = {
  name: string;
  description?: string;
  public: boolean;
};

export type SpotifyPlaylistOwner = {
  id: string;
};

export type SpotifyCreatedPlaylist = {
  id: string;
  name: string;
  description?: string | null;
  public?: boolean | null;
  external_urls?: SpotifyExternalUrls;
  images?: SpotifyImage[];
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  public: boolean | null;
  owner: SpotifyPlaylistOwner;
  external_urls?: SpotifyExternalUrls;
  images?: SpotifyImage[];
};

export type SpotifyApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "invalid_playlist_id"
  | "invalid_playlist_data"
  | "not_found"
  | "other";

export type PlaylistCreationResult = {
  playlistId: string;
  playlistUrl: string;
  playlistName: string;
  tracksAdded: number;
  tracksIgnored: number;
  success: boolean;
};

export type SpotifyTrack = {
  id: string;
  uri: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images?: { url: string }[];
  };
  images?: { url: string }[];
  preview_url?: string | null;
  duration_ms?: number;
  popularity?: number;
  external_urls?: SpotifyExternalUrls;
};

export type SpotifySearchTracksResponse = {
  tracks: {
    items: SpotifyTrack[];
  };
};

export type TrackSearchResult = {
  input: string;
  found: boolean;
  track?: {
    id: string;
    uri: string;
    name: string;
    artists: string[];
    albumName: string;
    imageUrl?: string;
  };
};

export type ParsedTrackInput = {
  original: string;
  title: string;
  artist?: string;
};
