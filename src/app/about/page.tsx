import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Conheça o PlaylistAI, suas tecnologias e integrações com Spotify e Gemini.",
};

const techStack = ["Next.js App Router", "TypeScript", "Tailwind CSS", "React 19", "Spotify Web API", "Gemini API"] as const;

export default function AboutPage() {
  return (
    <main className="px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-zinc-950/90 p-5">
          <BrandMark variant="mark" href="/" showLabel />
          <Link href="/" className="text-sm font-semibold text-zinc-300 transition hover:text-emerald-300">
            Voltar para a Home
          </Link>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/20 lg:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Sobre o projeto</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">O que é o PlaylistAI</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
            O PlaylistAI é uma aplicação que transforma descrições em playlists reais no Spotify. A proposta é unir
            inteligência artificial, busca automática de músicas e criação de playlists em uma experiência simples e pronta para produção.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Tecnologias utilizadas</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
              {techStack.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Objetivo do projeto</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              Demonstrar uma integração completa entre IA e Spotify com foco em experiência, automação e arquitetura moderna no App Router.
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Integração com Spotify</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              A autenticação usa o OAuth oficial do Spotify. A aplicação acessa apenas os dados necessários para ler o perfil,
              resolver músicas, criar playlists e adicionar faixas na conta do usuário.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Uso da API Gemini</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              A API Gemini é usada para interpretar o prompt do usuário e gerar sugestões de músicas coerentes com a intenção descrita.
            </p>
          </article>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 lg:p-10">
          <h2 className="text-2xl font-semibold">Links oficiais</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://github.com/alexandrecldias/playlist-ai"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              GitHub
            </a>
            <a
              href="https://www.spotify.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Spotify
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
