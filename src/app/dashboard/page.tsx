import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import SpotifyProfile from "@/components/spotify/SpotifyProfile";
import PlaylistList from "@/components/spotify/PlaylistList";
import EmptyState from "@/components/ui/EmptyState";
import { COOKIE_NAMES, isTokenExpiring, fetchSpotifyProfile, fetchSpotifyPlaylists, SpotifyApiError } from "@/lib/spotify";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Acesse suas playlists, crie novas playlists e gerencie sua conta Spotify.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
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

  let profileData;
  try {
    profileData = await fetchSpotifyProfile(accessToken as string);
  } catch (err) {
    if (err instanceof SpotifyApiError) {
      if (err.code === "unauthorized") {
        if (refreshToken) redirect("/api/auth/refresh?returnTo=%2Fdashboard");
        redirect("/?authError=refresh_failed");
      }
      if (err.code === "forbidden") {
        return (
          <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
            <main className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-zinc-950/90 p-10 shadow-xl shadow-black/30">
              <EmptyState
                title="Permissão insuficiente"
                description="Sua conta Spotify não tem as permissões necessárias para exibir este perfil."
              />
            </main>
          </div>
        );
      }
      if (err.code === "rate_limited") {
        return (
          <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
            <main className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-zinc-950/90 p-10 shadow-xl shadow-black/30">
              <EmptyState
                title="Limite de requisições atingida"
                description="O Spotify limitou temporariamente as requisições. Tente novamente mais tarde."
              />
            </main>
          </div>
        );
      }
    }
    if (refreshToken) redirect("/api/auth/refresh?returnTo=%2Fdashboard");
    redirect("/?authError=unexpected_error");
  }

  let playlistsData;
  try {
    const response = await fetchSpotifyPlaylists(accessToken as string, 20, 0);
    playlistsData = response.items;
  } catch (err) {
    if (err instanceof SpotifyApiError) {
      if (err.code === "unauthorized") {
        if (refreshToken) redirect("/api/auth/refresh?returnTo=%2Fdashboard");
        redirect("/?authError=refresh_failed");
      }
      if (err.code === "forbidden") {
        return (
          <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
            <main className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-zinc-950/90 p-10 shadow-xl shadow-black/30">
              <EmptyState
                title="Permissão insuficiente"
                description="Sua conta Spotify não tem as permissões necessárias para exibir suas playlists."
              />
            </main>
          </div>
        );
      }
      if (err.code === "rate_limited") {
        return (
          <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
            <main className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-zinc-950/90 p-10 shadow-xl shadow-black/30">
              <EmptyState
                title="Limite de requisições atingida"
                description="O Spotify limitou temporariamente as requisições. Tente novamente mais tarde."
              />
            </main>
          </div>
        );
      }
    }
    if (refreshToken) redirect("/api/auth/refresh?returnTo=%2Fdashboard");
    redirect("/?authError=unexpected_error");
  }

  return (
    <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
      <main className="mx-auto max-w-6xl space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(300px,360px)_1fr]">
          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/30">
            <SpotifyProfile profile={profileData} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/30 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Bem-vindo</p>
                <h2 className="text-3xl font-semibold text-white">Suas playlists</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="/playlists/new" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400">
                  Criar nova playlist
                </a>
                <a href="/playlists/add-tracks" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  Adicionar músicas em lote
                </a>
                <Link
                  href="/playlist/ai"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  Playlist com IA
                </Link>
                <form method="post" action="/api/auth/logout">
                  <button type="submit" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                    Sair
                  </button>
                </form>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/30">
              <PlaylistList playlists={playlistsData} currentUserId={profileData.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

