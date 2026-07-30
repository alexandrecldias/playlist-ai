import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PlaylistAI",
    short_name: "PlaylistAI",
    description: "Crie playlists inteligentes usando Inteligência Artificial e Spotify.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#071011",
    theme_color: "#1DB954",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["music", "entertainment"],
    screenshots: [
      {
        src: "/screenshot-540x720.png",
        sizes: "540x720",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshot-1280x720.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Acesse suas playlists",
        url: "/dashboard",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}
