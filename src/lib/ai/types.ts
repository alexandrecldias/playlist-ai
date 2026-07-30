export type GeneratePlaylistRequest = {
  prompt: string;
  maxSongs: number;
};

export type SuggestedSong = {
  title: string;
  artist: string;
};

export type GeneratePlaylistResponse = {
  songs: SuggestedSong[];
};
