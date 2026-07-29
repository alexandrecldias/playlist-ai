"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseTrackInput } from "@/lib/spotify/parser";
import { SpotifyPlaylistItem, TrackSearchResult } from "@/lib/spotify/types";
import { addTracksAction, searchTracksAction, AddTracksActionState } from "@/app/playlists/add-tracks/actions";

type Step = "input" | "searching" | "review" | "confirming" | "success" | "error";

export default function AddTracksForm({ playlists }: { playlists: SpotifyPlaylistItem[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || "");
  const [input, setInput] = useState<string>("");
  const [results, setResults] = useState<TrackSearchResult[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Set<number>>(new Set());
  const [state, setState] = useState<AddTracksActionState>({ status: "idle" });
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback(() => {
    if (!selectedPlaylistId || !input.trim()) {
      setError("Selecione uma playlist e cole as músicas.");
      return;
    }

    setError("");
    setStep("searching");

    const parsed = parseTrackInput(input);

    if (parsed.length === 0) {
      setError("Nenhuma música foi encontrada na entrada.");
      setStep("input");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("parsedInput", JSON.stringify(parsed));

      const searchResult = await searchTracksAction({ status: "idle" }, formData);

      if (searchResult.status === "success") {
        setResults(searchResult.results);

        // Auto-select found tracks
        const selected = new Set<number>();
        searchResult.results.forEach((result, index) => {
          if (result.found) {
            selected.add(index);
          }
        });
        setSelectedTracks(selected);

        setStep("review");
      } else if (searchResult.status === "error") {
        setError(searchResult.message);
        setStep("input");
      }
    });
  }, [selectedPlaylistId, input]);

  const handleToggleTrack = (index: number) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTracks(newSelected);
  };

  const handleConfirm = useCallback(() => {
    const selectedResults = results.filter((_, index) => selectedTracks.has(index) && _.found);

    if (selectedResults.length === 0) {
      setError("Selecione pelo menos uma música para adicionar.");
      return;
    }

    setError("");
    setStep("confirming");

    const trackUris = selectedResults.map((r) => r.track!.uri).join(",");
    const notFoundCount = results.filter((r) => !r.found).length;
    const deselectedCount = results.filter((r) => r.found && !selectedTracks.has(results.indexOf(r))).length;

    const formData = new FormData();
    formData.set("playlistId", selectedPlaylistId);
    formData.set("trackUris", trackUris);
    formData.set("notFoundCount", notFoundCount.toString());
    formData.set("deselectedCount", deselectedCount.toString());

    startTransition(async () => {
      const result = await addTracksAction({ status: "idle" }, formData);
      setState(result);

      if (result.status === "success") {
        setStep("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setStep("error");
      }
    });
  }, [selectedTracks, results, selectedPlaylistId, router]);

  const handleReset = () => {
    setStep("input");
    setInput("");
    setResults([]);
    setSelectedTracks(new Set());
    setError("");
  };

  if (step === "input") {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="playlist-select" className="block text-sm font-medium text-white">
            Escolha uma playlist:
          </label>
          <select
            id="playlist-select"
            value={selectedPlaylistId}
            onChange={(e) => setSelectedPlaylistId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-zinc-900/50 px-4 py-2 text-white placeholder-white/40 transition focus:border-emerald-500 focus:outline-none"
          >
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label htmlFor="track-input" className="block text-sm font-medium text-white">
            Cole as músicas (máximo 30):
          </label>
          <p className="text-xs text-white/50">Formato recomendado: &quot;Música - Artista&quot; (separadas por quebra de linha ou vírgula)</p>
          <textarea
            id="track-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Exemplo:\nWhat a Feeling - Irene Cara\nManiac - Michael Sembello\nTake On Me - a-ha"}
            className="h-48 w-full rounded-lg border border-white/10 bg-zinc-900/50 px-4 py-2 text-white placeholder-white/40 transition focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}

        <button
          onClick={handleSearch}
          disabled={isPending}
          className="w-full rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
        >
          {isPending ? "Procurando..." : "Procurar Músicas"}
        </button>
      </div>
    );
  }

  if (step === "searching") {
    return (
      <div className="flex items-center justify-center space-x-2 py-8">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-white/60">Pesquisando no Spotify...</p>
      </div>
    );
  }

  if (step === "review") {
    const foundCount = results.filter((r) => r.found).length;
    const notFoundCount = results.filter((r) => !r.found).length;
    const selectedCount = selectedTracks.size;

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-white">Revisar Resultados</h2>
          <p className="text-sm text-white/60">
            {foundCount} encontrada(s), {notFoundCount} não encontrada(s)
          </p>
        </div>

        <div className="max-h-96 space-y-3 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-zinc-900/50 p-3 transition hover:border-white/20"
            >
              <input
                type="checkbox"
                id={`track-${index}`}
                checked={selectedTracks.has(index)}
                onChange={() => handleToggleTrack(index)}
                disabled={!result.found}
                className="mt-1 cursor-pointer accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex-1 min-w-0">
                <label htmlFor={`track-${index}`} className="block text-sm text-white/80">
                  {result.input}
                </label>

                {result.found && result.track ? (
                  <div className="mt-1 space-y-0.5 text-xs text-white/50">
                    <p>
                      <span className="font-medium text-emerald-400">✓ Encontrada:</span> {result.track.name}
                    </p>
                    <p>{result.track.artists.join(", ")}</p>
                    <p>{result.track.albumName}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-red-400">✗ Não encontrada</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Voltar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedCount === 0 || isPending}
            className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {isPending ? "Adicionando..." : `Confirmar (${selectedCount})`}
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirming") {
    return (
      <div className="flex items-center justify-center space-x-2 py-8">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-white/60">Adicionando músicas à playlist...</p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm text-emerald-300">✓ {state.status === "success" ? state.message : "Sucesso!"}</p>
          {state.status === "success" && (
            <p className="mt-1 text-xs text-emerald-300/70">
              {state.notFound > 0 && `${state.notFound} não encontrada(s). `}
              {state.deselected > 0 && `${state.deselected} desmarcada(s).`}
            </p>
          )}
        </div>
        <p className="text-sm text-white/60">Redirecionando para o dashboard...</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-300">
            ✗{" "}
            {state.status !== "idle" && state.status !== "success" ? state.message : "Erro ao adicionar músicas"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Tentar Novamente
          </button>
          <a
            href="/dashboard"
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 text-center"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    );
  }

  return null;
}
