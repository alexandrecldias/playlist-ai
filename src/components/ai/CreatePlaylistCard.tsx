"use client";

import { useActionState, useMemo, useState } from "react";
import { createSpotifyPlaylistAction, type PlaylistCreationActionState } from "@/app/playlist/ai/actions";
import type { ResolvedPlaylist } from "@/lib/resolver";
import PlaylistCreationError from "./PlaylistCreationError";
import PlaylistCreationSuccess from "./PlaylistCreationSuccess";

type CreatePlaylistCardProps = {
  playlist: ResolvedPlaylist;
  suggestedName: string;
};

const initialState: PlaylistCreationActionState = {
  status: "idle",
};

function formatDescription(prompt: string): string {
  return prompt.trim() ? `Criada com PlaylistAI: ${prompt.trim()}` : "";
}

function PlaylistCreationSubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={pending ? "Criando playlist" : "Criar playlist no Spotify"}
      className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Criando playlist..." : "Criar Playlist no Spotify"}
    </button>
  );
}

export default function CreatePlaylistCard({ playlist, suggestedName }: CreatePlaylistCardProps) {
  const [state, formAction, pending] = useActionState(createSpotifyPlaylistAction, initialState);
  const [name, setName] = useState(suggestedName);
  const [description, setDescription] = useState(formatDescription(suggestedName));

  const serializedPlaylist = useMemo(() => JSON.stringify(playlist), [playlist]);

  if (state.status === "success") {
    return <PlaylistCreationSuccess result={state.result} />;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Criar Playlist</h3>
        <p className="mt-1 text-sm text-zinc-400">Revisou as músicas? Crie a playlist privada no Spotify agora.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="playlist" value={serializedPlaylist} />

        <div>
          <label htmlFor="playlist-name" className="block text-sm font-semibold text-zinc-200">
            Nome da playlist
          </label>
          <input
            id="playlist-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Nome da playlist"
            maxLength={100}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
          />
        </div>

        <div>
          <label htmlFor="playlist-description" className="block text-sm font-semibold text-zinc-200">
            Descrição
          </label>
          <textarea
            id="playlist-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-label="Descrição da playlist"
            rows={4}
            maxLength={300}
            className="mt-2 min-h-[110px] w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
          />
        </div>

        {state.status === "validation_error" || state.status === "api_error" ? (
          <PlaylistCreationError message={state.message} />
        ) : null}

        <div className="flex items-center gap-3">
          <PlaylistCreationSubmitButton pending={pending} />
        </div>
      </form>
    </section>
  );
}
