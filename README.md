# Site Taphiny — Visão Sistêmica

Site de página única da **Taphiny** (Visão Sistêmica / Mentoria Sistêmica), feito em **Astro** com edição de conteúdo via **TinaCMS**.

## Rodar localmente

```bash
npm install
npm run dev        # site + painel do Tina (http://localhost:4321 e /admin)
# ou
npm run dev:site   # só o site, sem o Tina
```

## Build

```bash
npm run build      # gera o site em dist/ (e o painel /admin se houver credenciais do Tina)
npm run preview    # pré-visualiza o build
```

O `npm run build` gera o painel `/admin` **apenas quando** as variáveis `TINA_CLIENT_ID` e `TINA_TOKEN` estão definidas. Sem elas, o site é gerado normalmente (o conteúdo é lido de `src/content/site.json`).

## Conteúdo editável

Todo o texto, a foto/vídeo da seção "Quem Conduz" e a música de fundo ficam em **`src/content/site.json`** e são editáveis pelo painel do TinaCMS (`/admin`). Imagens/arquivos enviados pelo painel vão para `public/uploads/`.

## Variáveis de ambiente (Tina Cloud)

Copie `.env.example` para `.env` (local) e cadastre as mesmas na Vercel:

| Variável | Onde obter |
|---|---|
| `TINA_CLIENT_ID` | Tina Cloud → projeto → Overview (Client ID) |
| `TINA_TOKEN` | Tina Cloud → projeto → Tokens (Read-Only Token) |
| `TINA_BRANCH` | branch editada (`main`) |

## Deploy (Vercel)

A Vercel detecta Astro automaticamente. O `vercel.json` já define o build (`npm run build`) e a saída (`dist`). Cadastre as três variáveis acima em *Project Settings → Environment Variables* para o painel `/admin` funcionar em produção.

## Estrutura

- `src/pages/index.astro` — a página (visual + animação da árvore + player de música).
- `src/content/site.json` — todo o conteúdo editável.
- `tina/config.ts` — schema do painel de edição (rótulos em português).
- `public/assets/` — imagens do tema (logo, ilustrações, favicons).
- `public/uploads/` — arquivos enviados pela editora (foto/vídeo/música).
