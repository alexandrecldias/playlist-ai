import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";

const steps = [
  {
    title: "Escreva o que deseja ouvir",
    description: "Descreva o clima, o gênero, o momento do dia ou a referência musical que você quer seguir.",
  },
  {
    title: "A IA encontra as melhores músicas",
    description: "O PlaylistAI interpreta seu pedido, gera a seleção e encontra faixas compatíveis no Spotify.",
  },
  {
    title: "A playlist é criada diretamente na sua conta Spotify",
    description: "Com as músicas resolvidas, a playlist é criada na sua biblioteca para você ouvir quando quiser.",
  },
] as const;

const resources = [
  "IA Generativa",
  "Busca automática no Spotify",
  "Criação de playlists",
  "Adição em lote",
  "Interface responsiva",
  "PWA",
] as const;

export const metadata: Metadata = {
  title: "PlaylistAI",
  description: "Crie playlists inteligentes usando Inteligência Artificial e Spotify.",
};

export default function Home() {
  return (
    <main className="bg-[radial-gradient(circle_at_top,_rgba(29,185,84,0.14),_transparent_42%),linear-gradient(180deg,_#081012_0%,_#061014_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <BrandMark variant="dark" href="/" showLabel />
          <nav className="flex flex-wrap gap-3 text-sm text-zinc-300">
            <Link className="transition hover:text-emerald-300" href="/about">
              Sobre
            </Link>
            <Link className="transition hover:text-emerald-300" href="/privacy">
              Privacidade
            </Link>
            <Link className="transition hover:text-emerald-300" href="/terms">
              Termos
            </Link>
          </nav>
        </header>

        <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-2xl shadow-black/30 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Spotify + IA em um fluxo único
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                PlaylistAI
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                Crie playlists inteligentes usando Inteligência Artificial e Spotify.
              </p>
              <p className="max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Uma experiência simples para transformar ideias em playlists prontas, com geração, resolução e criação automatizada.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/api/auth/login/spotify"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Entrar com Spotify
              </a>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                Conhecer o projeto
              </Link>
            </div>
          </div>

          <aside className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Como funciona</p>
              <h2 className="mt-3 text-2xl font-semibold">Fluxo pensado para produção</h2>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-black">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="text-sm leading-6 text-zinc-400">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
              OAuth oficial do Spotify, integração com Gemini e interface responsiva em um único produto.
            </div>
          </aside>
        </section>

        <section className="space-y-6 rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/20 lg:p-10">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Como funciona</p>
            <h2 className="text-3xl font-semibold text-white">Do pedido à playlist, em poucos passos</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-black">
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/20 lg:p-10">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Recursos</p>
            <h2 className="text-3xl font-semibold text-white">Um produto completo para uso real</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((item) => (
              <article key={item} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 h-2 w-12 rounded-full bg-emerald-400" />
                <h3 className="text-lg font-semibold text-white">{item}</h3>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
