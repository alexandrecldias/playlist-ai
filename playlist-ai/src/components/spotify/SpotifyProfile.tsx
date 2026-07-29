import type { SpotifyProfile } from "@/lib/spotify";

type SpotifyProfileProps = {
  profile: SpotifyProfile;
};

export default function SpotifyProfile({ profile }: SpotifyProfileProps) {
  const imageUrl = profile.images?.[0]?.url;
  const name = profile.display_name ?? "UsuÃ¡rio Spotify";
  const profileUrl = profile.external_urls?.spotify;

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 text-white shadow-lg shadow-black/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={`${name} avatar`} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-xl font-semibold text-zinc-200">U</div>
        )}
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Perfil Spotify</p>
          <h1 className="text-3xl font-semibold text-white">{name}</h1>
          {profileUrl ? (
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-300 hover:text-emerald-100">
              Ver perfil no Spotify
            </a>
          ) : (
            <p className="text-sm text-zinc-400">Link de perfil indisponível</p>
          )}
        </div>
      </div>
    </section>
  );
}

