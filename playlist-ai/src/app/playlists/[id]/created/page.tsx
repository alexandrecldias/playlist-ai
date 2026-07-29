import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import { COOKIE_NAMES, isTokenExpiring, fetchSpotifyProfile, fetchSpotifyPlaylistById, SpotifyApiError, SpotifyPlaylist, SpotifyProfile } from "@/lib/spotify";

type PlaylistCreatedPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlaylistCreatedPage({ params }: PlaylistCreatedPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  const expiresAt = cookieStore.get(COOKIE_NAMES.expiresAt)?.value;

  const needsRefresh = !accessToken || isTokenExpiring(expiresAt ? Number(expiresAt) : undefined);

  if (needsRefresh) {
    if (refreshToken) {
      redirect("/api/auth/refresh?returnTo=%2Fdashboard");
    }
    redirect("/");
  }

  let profile: SpotifyProfile | undefined;
  let playlist: SpotifyPlaylist | undefined;

  try {
    profile = await fetchSpotifyProfile(accessToken as string);
    playlist = await fetchSpotifyPlaylistById(accessToken as string, id);
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      if (error.code === "rate_limited") {
        return (
          <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
            <main className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-zinc-950/90 p-10 shadow-xl shadow-black/30">
              <EmptyState
                title="Limite temporário atingido"
                description="O Spotify limitou temporariamente as solicitações. Aguarde um pouco e tente novamente."
              />
            </main>
          </div>
        );
      }
      if (error.code === "unauthorized" && refreshToken) {
        redirect("/api/auth/refresh?returnTo=%2Fdashboard");
      }
      redirect("/dashboard");
    }

    redirect("/dashboard");
  }

  if (!playlist || !profile || playlist.owner.id !== profile.id) {
    return notFound();
  }

  const visibility = playlist.public === true ? "Pública" : playlist.public === false ? "Privada" : "Visibilidade desconhecida";
  const externalUrl = playlist.external_urls?.spotify;

  return (
    <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
      <main className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-950/90 p-10 shadow-xl shadow-black/30">
        <div className="space-y-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Playlist criada</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Playlist criada com sucesso</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
              Sua playlist {playlist.name} foi criada no Spotify. Ela está {visibility.toLowerCase()}.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Playlist</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{playlist.name}</h2>
                <p className="mt-2 text-sm text-zinc-400">Visibilidade: {visibility}</p>
              </div>
              {externalUrl ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                >
                  Abrir no Spotify
                </a>
              ) : null}
            </div>
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
