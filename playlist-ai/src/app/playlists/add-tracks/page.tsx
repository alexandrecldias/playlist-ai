import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAMES, fetchSpotifyProfile, fetchSpotifyPlaylists } from "@/lib/spotify";
import { isTokenExpiring } from "@/lib/spotify/auth";
import AddTracksForm from "@/components/spotify/AddTracksForm";

export const metadata = {
  title: "Adicionar Músicas em Lote - PlaylistAI",
  description: "Adicione múltiplas músicas à sua playlist do Spotify",
};

export default async function AddTracksPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  const expiresAt = cookieStore.get(COOKIE_NAMES.expiresAt)?.value;

  const needsRefresh = !accessToken || isTokenExpiring(expiresAt ? Number(expiresAt) : undefined);

  if (needsRefresh) {
    if (refreshToken) {
      redirect("/api/auth/refresh?returnTo=%2Fplaylists%2Fadd-tracks");
    }
    redirect("/");
  }

  const [profile, playlistsResponse] = await Promise.all([
    fetchSpotifyProfile(accessToken as string),
    fetchSpotifyPlaylists(accessToken as string, 50, 0),
  ]);

  // Filter only user's own playlists
  const userPlaylists = playlistsResponse.items.filter((playlist) => playlist.owner.id === profile.id);

  return (
    <div className="min-h-screen bg-[#081012] px-4 py-10 text-white sm:px-6">
      <main className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Adicionar Músicas em Lote</h1>
          <p className="text-white/60">Cole uma lista de músicas e adicione-as à sua playlist favorita do Spotify</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-xl shadow-black/30">
          <AddTracksForm playlists={userPlaylists} />
        </div>

        <div className="flex gap-4">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
