"use client";

import type { ResolvedTrack } from "@/lib/resolver";

type ResolvedTrackItemProps = {
  track: ResolvedTrack;
  index: number;
};

function statusLabel(track: ResolvedTrack): string {
  switch (track.status) {
    case "FOUND":
      return track.multipleMatches ? "⚠" : "✓";
    case "NOT_FOUND":
      return "✗";
    case "ERROR":
    default:
      return "!";
  }
}

export default function ResolvedTrackItem({ track, index }: ResolvedTrackItemProps) {
  return (
    <li className="rounded-3xl border border-white/10 bg-zinc-950/80 p-4">
      <p className="text-sm font-semibold text-emerald-400">
        {statusLabel(track)} {index}.
      </p>
      <h3 className="mt-2 text-base font-semibold text-white">{track.title}</h3>
      <p className="mt-1 text-sm text-zinc-300">{track.artist}</p>
      {track.album ? <p className="mt-1 text-sm text-zinc-400">{track.album}</p> : null}
      {track.externalUrl ? (
        <a
          href={track.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-semibold text-emerald-400 hover:text-emerald-300"
        >
          Abrir Spotify
        </a>
      ) : null}
      {track.status === "NOT_FOUND" ? <p className="mt-2 text-sm text-rose-300">Música não encontrada</p> : null}
      {track.multipleMatches ? (
        <p className="mt-2 text-sm text-amber-300">Existem múltiplas correspondências</p>
      ) : null}
      {track.status === "ERROR" ? <p className="mt-2 text-sm text-rose-300">Erro ao resolver esta música</p> : null}
    </li>
  );
}
