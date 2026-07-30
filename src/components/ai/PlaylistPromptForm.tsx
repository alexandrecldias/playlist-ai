"use client";

import { useActionState, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { generateAiPlaylistAction } from "@/app/playlist/ai/actions";
import type { AiPlaygroundActionState } from "@/app/playlist/ai/actions";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import ResolvedPlaylist from "./ResolvedPlaylist";

const initialState: AiPlaygroundActionState = {
  status: "idle",
};

type PlaylistPromptFormProps = {
  maxPromptChars: number;
};

function formatPlaylistName(prompt: string): string {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return "Nova Playlist";
  }

  return normalized
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type PromptEditorProps = {
  initialPrompt: string;
  maxPromptChars: number;
  formRef: RefObject<HTMLFormElement | null>;
};

function PromptEditor({ initialPrompt, maxPromptChars, formRef }: PromptEditorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div>
      <label htmlFor="prompt" className="block text-sm font-semibold text-zinc-200">
        Prompt da playlist
      </label>
      <textarea
        id="prompt"
        name="prompt"
        aria-label="Prompt para gerar playlist"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={"Exemplo:\n\nRock nacional anos 80\n\nMúsicas para dirigir à noite\n\nLo-fi para estudar\n\nPop internacional anos 2000"}
        rows={8}
        className="mt-2 min-h-[180px] w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400"
        maxLength={maxPromptChars}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
        <span>Descreva sua playlist com linguagem natural.</span>
        <span>
          {prompt.length} / {maxPromptChars}
        </span>
      </div>
    </div>
  );
}

export default function PlaylistPromptForm({ maxPromptChars }: PlaylistPromptFormProps) {
  const [state, formAction] = useActionState(generateAiPlaylistAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasError = state.status === "validation_error" || state.status === "error";
  const initialPrompt = state.status === "idle" ? "" : state.prompt;
  const editorKey = state.status === "idle" ? "idle" : state.prompt;

  return (
    <div className="space-y-6">
      <form ref={formRef} action={formAction} className="space-y-6">
        <PromptEditor key={editorKey} initialPrompt={initialPrompt} maxPromptChars={maxPromptChars} formRef={formRef} />

        <div className="flex items-center gap-3">
          <LoadingState />
        </div>

        {state.status === "idle" ? (
          <EmptyState title="🎵 Descreva uma playlist acima para começar." description="Use linguagem natural e pressione Ctrl + Enter para gerar." />
        ) : null}

        {hasError ? <ErrorState message={state.message} /> : null}
      </form>

      {state.status === "success" ? <ResolvedPlaylist playlist={state.playlist} suggestedName={formatPlaylistName(state.prompt)} /> : null}
    </div>
  );
}
