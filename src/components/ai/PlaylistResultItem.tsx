"use client";

import type { SuggestedSong } from "@/lib/ai";

type PlaylistResultItemProps = {
  song: SuggestedSong;
  index: number;
};

export default function PlaylistResultItem({ song, index }: PlaylistResultItemProps) {
  return (
    <li className="rounded-3xl border border-white/10 bg-zinc-950/80 p-4">
      <p className="text-sm font-semibold text-emerald-400">{index}.</p>
      <h3 className="mt-2 text-base font-semibold text-white">{song.title}</h3>
      <p className="mt-1 text-sm text-zinc-300">{song.artist}</p>
    </li>
  );
}
