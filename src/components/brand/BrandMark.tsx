import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  variant?: "light" | "dark" | "mark";
  className?: string;
  showLabel?: boolean;
};

const variantMap = {
  light: "/logo-light.svg",
  dark: "/logo-dark.svg",
  mark: "/logo-mark.svg",
} as const;

export default function BrandMark({ href = "/", variant = "mark", className = "", showLabel = false }: BrandMarkProps) {
  const src = variantMap[variant];
  const imageSize = variant === "mark" ? 40 : 180;
  const imageClassName =
    variant === "mark" ? "h-10 w-10" : "h-12 w-auto sm:h-14";

  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="PlaylistAI"
        width={imageSize}
        height={imageSize}
        className={imageClassName}
      />
      {showLabel ? (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">PlaylistAI</span>
          <span className="text-xs text-zinc-400">IA + Spotify + playlists inteligentes</span>
        </span>
      ) : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex">
      {content}
    </Link>
  );
}
