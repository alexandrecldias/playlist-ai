import { notFound } from "next/navigation";
import { AI_CONFIG } from "@/lib/ai";
import PlaylistPromptForm from "@/components/ai/PlaylistPromptForm";

export default function AiPlaygroundPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
      <main className="mx-auto max-w-4xl">
        <section className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/30 sm:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Playground</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">🎵 AI Playlist Playground</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            Descreva a playlist que deseja criar utilizando linguagem natural.
          </p>

          <div className="mt-8">
            <PlaylistPromptForm maxPromptChars={AI_CONFIG.maxPromptChars} />
          </div>
        </section>
      </main>
    </div>
  );
}
