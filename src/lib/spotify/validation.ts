export function validateSpotifyPlaylistId(playlistId: string): boolean {
  return (
    typeof playlistId === "string" &&
    playlistId.length > 0 &&
    playlistId.length <= 100 &&
    /^[A-Za-z0-9_-]+$/.test(playlistId)
  );
}
