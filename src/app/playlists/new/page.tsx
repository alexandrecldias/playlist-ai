import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAMES, isTokenExpiring } from "@/lib/spotify";
import CreatePlaylistForm from "@/components/spotify/CreatePlaylistForm";

export default async function NewPlaylistPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  const expiresAt = cookieStore.get(COOKIE_NAMES.expiresAt)?.value;

  const needsRefresh = !accessToken || isTokenExpiring(expiresAt ? Number(expiresAt) : undefined);

  if (needsRefresh) {
    if (refreshToken) {
      redirect("/api/auth/refresh?returnTo=%2Fplaylists%2Fnew");
    }
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
      <main className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-950/90 p-10 shadow-xl shadow-black/30">
        <div className="space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Nova playlist</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Criar nova playlist</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
              Dê um nome à sua playlist, escolha se ela ficará privada ou pública e crie uma lista vazia no Spotify.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/20">
            <CreatePlaylistForm />
          </div>

          <div className="flex justify-end">
            <a href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Voltar ao dashboard
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

