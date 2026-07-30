import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";
import { AI_CONFIG } from "@/lib/ai";
import PlaylistPromptForm from "@/components/ai/PlaylistPromptForm";

export const metadata: Metadata = {
  title: "Playlist com IA",
  description: "Crie playlists inteligentes com IA, Spotify e uma experiência guiada.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AiPlaylistPage() {
  return (
    <main className="px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-zinc-950/90 p-5">
          <BrandMark variant="mark" href="/" showLabel />
          <Link href="/dashboard" className="text-sm font-semibold text-zinc-300 transition hover:text-emerald-300">
            Voltar ao Dashboard
          </Link>
        </div>

        <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/20 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Playlist com IA</p>
            <h1 className="text-3xl font-semibold sm:text-5xl">Descreva a vibe, a IA faz o resto.</h1>
            <p className="max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
              Use linguagem natural para gerar uma playlist personalizada. A IA encontra músicas, o Spotify recebe a playlist e você controla tudo em um único fluxo.
            </p>
          </div>

          <aside className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Fluxo</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
              <p>1. Escreva um prompt natural.</p>
              <p>2. A IA gera e resolve as músicas.</p>
              <p>3. A playlist é criada na sua conta Spotify.</p>
            </div>
          </aside>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/20 lg:p-10">
          <PlaylistPromptForm maxPromptChars={AI_CONFIG.maxPromptChars} />
        </section>
      </div>
    </main>
  );
}
