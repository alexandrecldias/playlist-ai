type EmptyStateProps = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center text-white shadow-lg shadow-black/10">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm text-zinc-400">{description}</p>
    </div>
  );
}

