"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createPlaylistAction } from "@/app/playlists/new/actions";

type ActionValues = {
  name: string;
  description: string;
  visibility: "private" | "public";
};

const initialValues: ActionValues = {
  name: "",
  description: "",
  visibility: "private",
};

export default function CreatePlaylistForm() {
  const [actionState, dispatch, isPending] = useFormState(createPlaylistAction, { status: "idle" } as const);
  const [values, setValues] = useState<ActionValues>(initialValues);

  const fieldErrors = actionState && actionState.status === "validation_error" ? actionState.fieldErrors : undefined;
  const apiErrorMessage = actionState && actionState.status === "api_error" ? actionState.message : undefined;

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-zinc-200">
          Nome da playlist
        </label>
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={(event) => setValues((previous) => ({ ...previous, name: event.target.value }))}
          maxLength={100}
          autoComplete="off"
          className="mt-2 w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
          <p>{fieldErrors?.name ?? ""}</p>
          <p>{values.name.length}/100</p>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-zinc-200">
          Descrição opcional
        </label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={(event) => setValues((previous) => ({ ...previous, description: event.target.value }))}
          maxLength={300}
          rows={5}
          className="mt-2 min-h-[140px] w-full rounded-3xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
          <p>{fieldErrors?.description ?? ""}</p>
          <p>{values.description.length}/300</p>
        </div>
      </div>

      <fieldset className="rounded-3xl border border-white/10 bg-zinc-900 p-4">
        <legend className="text-sm font-semibold text-zinc-200">Visibilidade</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-zinc-950/80 px-4 py-3 transition hover:border-emerald-300/50">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={values.visibility === "private"}
              onChange={() => setValues((previous) => ({ ...previous, visibility: "private" }))}
              className="h-4 w-4 text-emerald-400 accent-emerald-400"
            />
            <span>
              <span className="block text-sm font-semibold text-white">Privada</span>
              <span className="block text-sm text-zinc-400">Somente você poderá visualizar esta playlist.</span>
            </span>
          </label>

          <label className="inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-zinc-950/80 px-4 py-3 transition hover:border-emerald-300/50">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={values.visibility === "public"}
              onChange={() => setValues((previous) => ({ ...previous, visibility: "public" }))}
              className="h-4 w-4 text-emerald-400 accent-emerald-400"
            />
            <span>
              <span className="block text-sm font-semibold text-white">Pública</span>
              <span className="block text-sm text-zinc-400">Qualquer pessoa com o link poderá ver esta playlist.</span>
            </span>
          </label>
        </div>
      </fieldset>

      {apiErrorMessage ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {apiErrorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Criando..." : "Criar playlist"}
        </button>
      </div>
    </form>
  );
}
