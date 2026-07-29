export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="w-full max-w-3xl p-8">
        <div className="bg-white dark:bg-zinc-900 shadow-md rounded-lg p-10">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">PlaylistAI</h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">Crie playlists inteligentes e personalize suas recomendaÃ§Ãµes â€” autentique-se com Spotify para comeÃ§ar.</p>

          <div className="mt-8">
            <a
              href="/api/auth/login/spotify"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
            >
              Entrar com Spotify
            </a>
          </div>

          <p className="mt-6 text-sm text-zinc-500">Ao entrar, serÃ¡ solicitado acesso Ã s permissÃµes necessÃ¡rias para gerenciar suas playlists.</p>
        </div>
      </main>
    </div>
  );
}

