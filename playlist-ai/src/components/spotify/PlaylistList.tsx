import { SpotifyPlaylistItem } from "@/lib/spotify";
import EmptyState from "@/components/ui/EmptyState";
import PlaylistCard from "@/components/spotify/PlaylistCard";

type PlaylistListProps = {
  playlists: SpotifyPlaylistItem[];
};

export default function PlaylistList({ playlists }: PlaylistListProps) {
  if (!playlists || playlists.length === 0) {
    return (
      <EmptyState
        title="Nenhuma playlist encontrada"
        description="Conecte-se ao Spotify e volte mais tarde para ver suas playlists aqui."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}

