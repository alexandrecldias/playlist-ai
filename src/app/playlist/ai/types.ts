import type { ResolvedPlaylist } from "@/lib/resolver";

export type PlaylistCreationRequest = {
  name: string;
  description?: string;
  playlist: ResolvedPlaylist;
};
