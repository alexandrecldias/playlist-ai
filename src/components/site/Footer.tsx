import Link from "next/link";
import BrandMark from "@/components/brand/BrandMark";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Sobre" },
  { href: "/privacy", label: "Política de Privacidade" },
  { href: "/terms", label: "Termos de Uso" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#061014] px-4 py-8 text-sm text-zinc-400 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <BrandMark variant="mark" href="/" className="text-white" />
          <p className="max-w-md leading-6">
            PlaylistAI cria playlists inteligentes com IA e Spotify, mantendo uma experiência simples, rápida e pronta para produção.
          </p>
        </div>

        <nav aria-label="Rodapé" className="flex flex-wrap gap-4">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-emerald-300">
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/alexandrecldias/playlist-ai"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-emerald-300"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
