import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/site/Footer";

const baseUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1DB954",
};

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: "PlaylistAI",
    template: "%s | PlaylistAI",
  },
  description: "Crie playlists inteligentes usando Inteligência Artificial e Spotify.",
  manifest: "/manifest.json",
  applicationName: "PlaylistAI",
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PlaylistAI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "PlaylistAI",
    title: "PlaylistAI",
    description: "Crie playlists inteligentes usando Inteligência Artificial e Spotify.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PlaylistAI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlaylistAI",
    description: "Crie playlists inteligentes usando Inteligência Artificial e Spotify.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PlaylistAI" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="flex min-h-full flex-col bg-[#081012] text-white">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
