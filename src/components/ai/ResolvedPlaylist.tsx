"use client";

import type { ResolvedPlaylist as ResolvedPlaylistType } from "@/lib/resolver";
import CreatePlaylistCard from "./CreatePlaylistCard";
import PlaylistSummary from "./PlaylistSummary";
import ResolvedTrackItem from "./ResolvedTrackItem";

type ResolvedPlaylistProps = {
  playlist: ResolvedPlaylistType;
  suggestedName: string;
};

export default function ResolvedPlaylist({ playlist, suggestedName }: ResolvedPlaylistProps) {
  return (
    <section aria-labelledby="resolved-playlist-title" className="space-y-4">
      <h2 id="resolved-playlist-title" className="text-lg font-semibold text-white">
        Playlist resolvida
      </h2>
      <PlaylistSummary playlist={playlist} />
      <ol className="grid gap-4">
        {playlist.tracks.map((track, index) => (
          <ResolvedTrackItem key={`${track.title}-${track.artist}-${index}`} track={track} index={index + 1} />
        ))}
      </ol>
      <CreatePlaylistCard playlist={playlist} suggestedName={suggestedName} />
    </section>
  );
}
