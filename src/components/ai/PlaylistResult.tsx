"use client";

import type { SuggestedSong } from "@/lib/ai";
import PlaylistResultItem from "./PlaylistResultItem";

type PlaylistResultProps = {
  songs: SuggestedSong[];
};

export default function PlaylistResult({ songs }: PlaylistResultProps) {
  return (
    <section aria-labelledby="playlist-result-title" className="space-y-4">
      <h2 id="playlist-result-title" className="text-lg font-semibold text-white">
        Resultado
      </h2>
      <ol className="grid gap-4">
        {songs.map((song, index) => (
          <PlaylistResultItem key={`${song.title}-${song.artist}-${index}`} song={song} index={index + 1} />
        ))}
      </ol>
    </section>
  );
}
