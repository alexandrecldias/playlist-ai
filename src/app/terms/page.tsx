import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Leia os termos de uso do PlaylistAI antes de utilizar o aplicativo.",
};

export default function TermsPage() {
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
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Termos</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Termos de Uso</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
            O PlaylistAI é um projeto experimental preparado para produção, mas sem promessa de disponibilidade contínua ou garantia de resultados.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Uso das APIs oficiais</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              O aplicativo utiliza a API oficial do Spotify e a API Gemini para gerar e resolver playlists.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Responsabilidade do usuário</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              O usuário é responsável pelas playlists criadas, pelas músicas adicionadas e pelo uso que fizer das funcionalidades do serviço.
            </p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Disponibilidade</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              Não existe garantia de disponibilidade permanente, continuidade ininterrupta ou ausência de falhas.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Cobrança</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              Não existe cobrança para uso do PlaylistAI nesta versão.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
