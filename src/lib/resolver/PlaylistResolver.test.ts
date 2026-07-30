import assert from "node:assert/strict";
import test from "node:test";
import { PlaylistResolver } from "./PlaylistResolver.ts";
import type { SpotifyTrack } from "../spotify/types.ts";

function createTrack(overrides: Partial<SpotifyTrack> & { id: string; uri: string; name: string; artist: string }): SpotifyTrack {
  return {
    id: overrides.id,
    uri: overrides.uri,
    name: overrides.name,
    artists: [{ name: overrides.artist }],
    album: {
      name: overrides.album?.name ?? "Album",
      images: overrides.album?.images ?? [{ url: "https://example.com/album.jpg" }],
    },
    images: overrides.images ?? [{ url: "https://example.com/track.jpg" }],
    preview_url: overrides.preview_url ?? "https://example.com/preview.mp3",
    duration_ms: overrides.duration_ms ?? 180000,
    popularity: overrides.popularity ?? 80,
    external_urls: overrides.external_urls ?? { spotify: "https://open.spotify.com/track/example" },
  };
}

test("PlaylistResolver resolves tracks, deduplicates requests, and keeps multiple matches playable", async () => {
  const calls: string[] = [];
  const resolver = new PlaylistResolver("access-token", async (_accessToken, title, artist) => {
    calls.push(`${title} - ${artist ?? ""}`);

    if (title === "Tempo Perdido") {
      return [
        createTrack({
          id: "tempo-1",
          uri: "spotify:track:tempo-1",
          name: "Tempo Perdido",
          artist: "Legião Urbana",
          album: { name: "Dois" },
        }),
      ];
    }

    return [
      createTrack({
        id: "lanterna-1",
        uri: "spotify:track:lanterna-1",
        name: "Lanterna dos Afogados",
        artist: "Os Paralamas do Sucesso",
        album: { name: "Big Bang" },
      }),
      createTrack({
        id: "lanterna-2",
        uri: "spotify:track:lanterna-2",
        name: "Lanterna dos Afogados (Ao Vivo)",
        artist: "Os Paralamas do Sucesso",
        album: { name: "Ao Vivo" },
      }),
    ];
  });

  const result = await resolver.resolvePlaylist({
    songs: [
      { title: "Tempo Perdido", artist: "Legião Urbana" },
      { title: "Tempo Perdido", artist: "Legião Urbana" },
      { title: "Lanterna dos Afogados", artist: "Os Paralamas do Sucesso" },
    ],
  });

  assert.equal(calls.length, 2);
  assert.equal(result.total, 3);
  assert.equal(result.foundCount, 3);
  assert.equal(result.notFoundCount, 0);
  assert.equal(result.multipleMatchesCount, 1);
  assert.equal(result.errorCount, 0);
  assert.equal(result.successRate, 100);
  assert.equal(result.tracks[0].status, "FOUND");
  assert.equal(result.tracks[1].status, "FOUND");
  assert.equal(result.tracks[2].status, "FOUND");
  assert.equal(result.tracks[2].multipleMatches, true);
  assert.equal(result.tracks[2].spotifyId, "lanterna-1");
  assert.equal(result.tracks[2].spotifyUri, "spotify:track:lanterna-1");
});

test("PlaylistResolver marks tracks as not found when Spotify returns no candidates", async () => {
  const resolver = new PlaylistResolver("access-token", async () => []);

  const result = await resolver.resolvePlaylist({
    songs: [{ title: "Música Invisível", artist: "Artista Desconhecido" }],
  });

  assert.equal(result.total, 1);
  assert.equal(result.foundCount, 0);
  assert.equal(result.notFoundCount, 1);
  assert.equal(result.errorCount, 0);
  assert.equal(result.tracks[0].status, "NOT_FOUND");
});

test("PlaylistResolver marks a song as error and keeps resolving the others", async () => {
  const resolver = new PlaylistResolver("access-token", async (_accessToken, title) => {
    if (title === "Falha") {
      throw new Error("Spotify unavailable");
    }

    return [
      createTrack({
        id: "ok-1",
        uri: "spotify:track:ok-1",
        name: title,
        artist: "Artista",
        album: { name: "Album" },
      }),
    ];
  });

  const result = await resolver.resolvePlaylist({
    songs: [
      { title: "Falha", artist: "Artista" },
      { title: "Sucesso", artist: "Artista" },
    ],
  });

  assert.equal(result.total, 2);
  assert.equal(result.errorCount, 1);
  assert.equal(result.foundCount, 1);
  assert.equal(result.tracks[0].status, "ERROR");
  assert.equal(result.tracks[1].status, "FOUND");
});
