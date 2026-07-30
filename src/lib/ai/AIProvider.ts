import type { GeneratePlaylistRequest, GeneratePlaylistResponse } from "./types";

export interface AIProvider {
  generatePlaylist(request: GeneratePlaylistRequest): Promise<GeneratePlaylistResponse>;
}
