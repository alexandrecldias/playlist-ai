import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Entenda quais dados o PlaylistAI utiliza e como o acesso ao Spotify é tratado.",
};

const items = [
  "Nome e imagem do perfil Spotify para exibição na interface.",
  "Informações das playlists e músicas selecionadas para executar as ações solicitadas.",
  "Tokens OAuth temporários, usados apenas para autenticação e chamadas necessárias ao Spotify.",
  "Prompt enviado pelo usuário para geração da playlist via Gemini, quando a funcionalidade for utilizada.",
] as const;

export default function PrivacyPage() {
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
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">Privacidade</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Política de Privacidade</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
            O PlaylistAI foi construído para funcionar com o mínimo necessário de dados do usuário, sempre por meio dos fluxos oficiais do Spotify.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Quais dados utilizamos</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">O que não fazemos</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
              <li>Não armazenamos senha do Spotify.</li>
              <li>Não vendemos dados pessoais.</li>
              <li>Não compartilhamos tokens com terceiros.</li>
              <li>Não usamos dados além do necessário para as funcionalidades do app.</li>
            </ul>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Autenticação e tokens</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              Utilizamos OAuth oficial do Spotify. Os tokens são utilizados apenas para acessar a conta do usuário e executar as ações solicitadas,
              como visualizar playlists, criar playlists e adicionar músicas.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6">
            <h2 className="text-2xl font-semibold">Revogação de acesso</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              O usuário pode revogar o acesso a qualquer momento diretamente nas configurações da conta Spotify.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
