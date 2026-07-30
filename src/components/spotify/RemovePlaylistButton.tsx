"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { removePlaylistAction, type RemovePlaylistActionState } from "@/app/dashboard/actions";

type RemovePlaylistButtonProps = {
  playlistId: string;
  playlistName: string;
};

const initialState: RemovePlaylistActionState = {
  status: "idle",
};

export default function RemovePlaylistButton({ playlistId, playlistName }: RemovePlaylistButtonProps) {
  const [state, dispatch, isPending] = useActionState(removePlaylistAction, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const closeDialog = () => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (dialog.open) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }

    triggerRef.current?.focus();
  };

  const openDialog = () => {
    console.info("[RemovePlaylistButton] trigger clicked", {
      hasDialog: Boolean(dialogRef.current),
    });

    const dialog = dialogRef.current;
    if (!dialog) {
      console.error("[RemovePlaylistButton] dialog ref unavailable");
      return;
    }

    if (dialog.open) {
      return;
    }

    try {
      dialog.showModal();
    } catch (error) {
      console.error("[RemovePlaylistButton] showModal failed", {
        errorName: error instanceof Error ? error.name : "UnknownError",
        errorMessage: error instanceof Error ? error.message.slice(0, 200) : undefined,
      });
    }
  };

  useEffect(() => {
    if (state.status === "success") {
      closeDialog();
      router.refresh();
    }
  }, [router, state]);

  const messageToShow =
    state.status === "validation_error" || state.status === "forbidden" || state.status === "api_error"
      ? state.message
      : undefined;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        className="inline-flex items-center justify-center rounded-full border border-rose-400/50 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
      >
        Remover
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="remove-playlist-title"
        aria-describedby="remove-playlist-description"
        className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl shadow-black/30 backdrop:bg-black/70"
      >
        <div className="space-y-4">
          <div>
            <h3 id="remove-playlist-title" className="text-xl font-semibold text-white">
              Remover playlist da biblioteca
            </h3>
            <p id="remove-playlist-description" className="mt-2 text-sm text-zinc-400">
              {playlistName} será removida da sua biblioteca do Spotify.
            </p>
          </div>

          <form action={dispatch} className="space-y-4">
            <input type="hidden" name="playlistId" value={playlistId} />

            {messageToShow ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-100" role="alert" aria-live="polite">
                {messageToShow}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex items-center justify-center rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Removendo..." : "Confirmar remoção"}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {state.status === "success" ? (
        <div className="mt-2 text-sm text-emerald-300" role="status" aria-live="polite">
          {state.message}
        </div>
      ) : null}
    </>
  );
}
