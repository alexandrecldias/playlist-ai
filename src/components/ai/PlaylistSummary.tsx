"use client";

import type { ResolvedPlaylist } from "@/lib/resolver";

type PlaylistSummaryProps = {
  playlist: ResolvedPlaylist;
};

export default function PlaylistSummary({ playlist }: PlaylistSummaryProps) {
  return (
    <div className="grid gap-3 rounded-3xl border border-white/10 bg-zinc-950/80 p-4 text-sm text-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
      <p>
        {playlist.foundCount} de {playlist.total} músicas encontradas
      </p>
      <p>{playlist.successRate}%</p>
      <p>{playlist.notFoundCount} não encontradas</p>
      <p>{playlist.multipleMatchesCount} com múltiplas correspondências</p>
    </div>
  );
}
