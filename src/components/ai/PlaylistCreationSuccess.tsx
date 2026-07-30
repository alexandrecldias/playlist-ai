"use client";

import type { PlaylistCreationResult } from "@/lib/spotify";

type PlaylistCreationSuccessProps = {
  result: PlaylistCreationResult;
};

export default function PlaylistCreationSuccess({ result }: PlaylistCreationSuccessProps) {
  return (
    <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-100" aria-live="polite">
      <h3 className="text-lg font-semibold text-white">Playlist criada com sucesso.</h3>
      <p className="mt-2">{result.playlistName}</p>
      <p className="mt-1">
        {result.tracksAdded} músicas adicionadas · {result.tracksIgnored} ignoradas
      </p>
      <a
        href={result.playlistUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex rounded-full bg-white px-4 py-2 font-semibold text-black transition hover:bg-zinc-100"
      >
        Abrir no Spotify
      </a>
    </section>
  );
}
