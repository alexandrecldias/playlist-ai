# PlaylistAI

PlaylistAI é uma aplicação web em Next.js que usa Spotify e Gemini para criar playlists inteligentes a partir de linguagem natural.

## Visão geral

- cria playlists com IA;
- busca e resolve músicas automaticamente no Spotify;
- cria playlists privadas na conta do usuário;
- permite adicionar músicas em lote;
- oferece uma experiência responsiva e compatível com PWA.

## Tecnologias

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Spotify Web API
- Gemini API
- Server Actions

## Funcionalidades

- autenticação com Spotify via OAuth oficial;
- geração de playlists por prompt;
- criação de playlist no Spotify;
- adição em lote de músicas;
- dashboard com playlists do usuário;
- páginas institucionais para produção;
- SEO básico, sitemap e robots configurados;
- branding com favicon, app icon e logo em SVG/PNG.

## Arquitetura

### Rotas públicas

- `/` — landing page
- `/about` — sobre o projeto
- `/privacy` — política de privacidade
- `/terms` — termos de uso

### Rotas autenticadas

- `/dashboard`
- `/playlist/ai`
- `/playlists/new`
- `/playlists/add-tracks`

### Server Actions

- `generateAiPlaylistAction`
- `createSpotifyPlaylistAction`
- `createPlaylistAction`
- `addTracksAction`
- `searchTracksAction`
- `removePlaylistAction`

### Camadas principais

- `src/app/` — rotas, layouts e metadata
- `src/components/` — UI compartilhada
- `src/lib/spotify/` — autenticação e chamadas à API do Spotify
- `src/lib/ai/` — integração com Gemini e parsing
- `src/lib/resolver/` — resolução de músicas encontradas

## Como executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
SPOTIFY_CLIENT_ID=
SPOTIFY_REDIRECT_URI=
NEXT_PUBLIC_APP_URL=
AI_PROVIDER=
GEMINI_API_KEY=
GEMINI_MODEL=
```

## Integração com Spotify

- usa OAuth oficial com PKCE;
- as chamadas ao Spotify ocorrem no servidor quando necessário;
- tokens são mantidos em cookies HttpOnly;
- playlists são criadas como privadas por padrão;
- o usuário pode revogar o acesso na conta Spotify.

### Redirect URI

Configure a URI de callback no Spotify Developer Dashboard para o domínio da aplicação, por exemplo:

```text
https://seu-dominio.com/api/auth/callback/spotify
```

## Integração com Gemini

- o provider atual é `gemini`;
- a chave fica apenas no servidor;
- a IA gera a estrutura inicial da playlist;
- a resposta é validada antes de seguir para resolução no Spotify.

## Deploy na Vercel

1. Adicione as variáveis de ambiente no projeto da Vercel.
2. Configure `NEXT_PUBLIC_APP_URL` com a URL pública.
3. Configure a `SPOTIFY_REDIRECT_URI` com o domínio de produção.
4. Atualize o app no Spotify Developer Dashboard.
5. Faça o deploy normalmente pela Vercel.

## Branding e SEO

- favicon e ícones de app em SVG/PNG;
- metadata com title, description, Open Graph e Twitter Card;
- sitemap e robots configurados;
- páginas institucionais públicas.

## Capturas

Se quiser visualizar a interface, consulte os arquivos em `public/`:

- `public/screenshot-1280x720.png`
- `public/screenshot-540x720.png`

## Licença

Projeto privado.
