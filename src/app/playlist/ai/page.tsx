import Link from "next/link";
import { AI_CONFIG } from "@/lib/ai";
import PlaylistPromptForm from "@/components/ai/PlaylistPromptForm";

export default function AiPlaygroundPage() {

  return (
    <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
      <main className="mx-auto max-w-4xl">
        <section className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/30 sm:p-10">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              <span aria-hidden="true">←</span>
              <span>Voltar ao Dashboard</span>
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">🎵 Criar Playlist com IA</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
              Descreva a playlist que deseja criar utilizando linguagem natural. Nossa IA irá buscar as músicas no Spotify e criar a playlist para você.
            </p>
          </div>

          <div className="mt-8">
            <PlaylistPromptForm maxPromptChars={AI_CONFIG.maxPromptChars} />
          </div>
        </section>
      </main>
    </div>
  );
}
