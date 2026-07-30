"use client";

import { useFormStatus } from "react-dom";

export default function LoadingState() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col gap-2">
      <button
        type="submit"
        disabled={pending}
        aria-label={pending ? "Gerando playlist" : "Gerar playlist"}
        className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Gerando playlist..." : "Gerar Playlist"}
      </button>
      {pending ? (
        <p className="text-sm text-zinc-400" aria-live="polite">
          Resolvendo músicas...
        </p>
      ) : null}
    </div>
  );
}
