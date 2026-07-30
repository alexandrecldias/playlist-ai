import RemovePlaylistButton from "@/components/spotify/RemovePlaylistButton";
import { SpotifyPlaylistItem } from "@/lib/spotify";

type PlaylistCardProps = {
  playlist: SpotifyPlaylistItem;
  canRemove?: boolean;
};

function formatItemCount(total: number | undefined | null): string {
  // Converter string para número, se necessário
  const numValue = typeof total === "string" ? Number.parseInt(total, 10) : total;
  
  // Validar se é um número válido e não negativo
  if (typeof numValue === "number" && Number.isFinite(numValue) && numValue >= 0) {
    return numValue === 1 ? "1 item" : `${numValue} itens`;
  }
  
  return "Quantidade indisponível";
}

export default function PlaylistCard({ playlist, canRemove = false }: PlaylistCardProps) {
  const imageUrl = playlist.images?.[0]?.url;
  console.log("========== PLAYLIST ==========");
  console.log(playlist);
  console.log(playlist.items?.total);
  const itemCount = formatItemCount(playlist.items?.total ?? null);
  const visibility = playlist.public === true ? "Pública" : playlist.public === false ? "Privada" : "Visibilidade desconhecida";
  const externalUrl = playlist.external_urls?.spotify;

  return (
    <article className="group grid gap-4 rounded-3xl border border-white/10 bg-zinc-950/90 p-5 text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 sm:grid-cols-[88px_minmax(0,1fr)]">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={playlist.name} className="h-24 w-24 rounded-3xl object-cover" />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-zinc-800 text-sm text-zinc-400">Sem imagem</div>
      )}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{playlist.name}</h3>
            <p className="mt-1 max-h-12 overflow-hidden text-sm text-zinc-400">{playlist.description ?? "Sem descrição."}</p>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
            {visibility}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <span>{itemCount}</span>
          {externalUrl ? (
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-white">
              Abrir no Spotify
            </a>
          ) : null}
          {canRemove ? <RemovePlaylistButton playlistId={playlist.id} playlistName={playlist.name} /> : null}
        </div>
      </div>
    </article>
  );
}

