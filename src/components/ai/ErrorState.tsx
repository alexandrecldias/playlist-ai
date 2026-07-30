"use client";

type ErrorStateProps = {
  message: string;
};

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200" role="alert" aria-live="polite">
      {message}
    </div>
  );
}
