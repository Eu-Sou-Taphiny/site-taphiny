import { defineConfig } from "tinacms";

// Branch/credenciais vêm de variáveis de ambiente (ver .env.example).
const branch =
  process.env.TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || "", // Tina Cloud → Client ID
  token: process.env.TINA_TOKEN || "", // Tina Cloud → Read-Only Token

  build: {
    outputFolder: "admin", // painel disponível em /admin
    publicFolder: "public",
  },
  media: {
    tina: {
      // arquivos enviados pelo painel vão para public/uploads e viram /uploads/...
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      {
        name: "site",
        label: "Conteúdo do Site",
        path: "src/content",
        format: "json",
        match: { include: "site" },
        ui: {
          // documento único: sem criar/apagar. Sem `router` para abrir num
          // formulário normal e editável no /admin (a edição visual no preview
          // exigiria useTina/tinaField na página, o que não usamos aqui).
          allowedActions: { create: false, delete: false },
        },
        fields: [
          // ---------- SEO ----------
          {
            type: "object",
            name: "seo",
            label: "SEO (título e descrição no Google)",
            fields: [
              { type: "string", name: "titulo", label: "Título da página (50–60 caracteres)" },
              { type: "string", name: "descricao", label: "Descrição (140–160 caracteres)", ui: { component: "textarea" } },
            ],
          },
          // ---------- HERO ----------
          {
            type: "object",
            name: "hero",
            label: "Topo (Hero)",
            fields: [
              { type: "string", name: "marca", label: "Marca (ex.: TAPHINY)" },
              { type: "string", name: "subtitulo", label: "Subtítulo (ex.: Mentora Sistêmica)" },
              { type: "string", name: "titulo", label: "Título principal" },
              { type: "string", name: "paragrafo", label: "Parágrafo", ui: { component: "textarea" } },
              { type: "string", name: "frase", label: "Frase em destaque (itálico)" },
              { type: "string", name: "cta", label: "Texto do botão" },
            ],
          },
          // ---------- PROVOCAÇÃO ----------
          {
            type: "object",
            name: "provocacao",
            label: "Seção: O que carregamos",
            fields: [
              { type: "string", name: "rotulo", label: "Rótulo (linha pequena)" },
              { type: "string", name: "titulo", label: "Título" },
              { type: "string", name: "paragrafo1", label: "Parágrafo 1", ui: { component: "textarea" } },
              { type: "string", name: "paragrafo2", label: "Parágrafo 2", ui: { component: "textarea" } },
            ],
          },
          // ---------- VISÃO SISTÊMICA ----------
          {
            type: "object",
            name: "visao",
            label: "Seção: O que é Visão Sistêmica",
            fields: [
              { type: "string", name: "rotulo", label: "Rótulo" },
              { type: "string", name: "titulo", label: "Título" },
              { type: "string", name: "definicao", label: "Definição (1º parágrafo)", ui: { component: "textarea" } },
              { type: "string", name: "paragrafo", label: "Parágrafo complementar", ui: { component: "textarea" } },
              {
                type: "object",
                name: "pilares",
                label: "Pilares (Pertencer / Ordenar / Fluir)",
                list: true,
                ui: { itemProps: (i) => ({ label: i?.titulo || "Pilar" }) },
                fields: [
                  { type: "string", name: "titulo", label: "Título do pilar" },
                  { type: "string", name: "texto", label: "Texto" },
                ],
              },
            ],
          },
          // ---------- QUEM CONDUZ ----------
          {
            type: "object",
            name: "quemConduz",
            label: "Seção: Quem conduz (foto/vídeo)",
            fields: [
              { type: "image", name: "foto", label: "Foto (4:5) — deixe vazio se for usar vídeo" },
              { type: "image", name: "video", label: "Vídeo (mp4) — deixe vazio se for usar foto" },
              { type: "image", name: "videoCapa", label: "Capa do vídeo (opcional)" },
              { type: "string", name: "rotulo", label: "Rótulo" },
              { type: "string", name: "titulo", label: "Título (itálico)" },
              { type: "string", name: "paragrafo1", label: "Parágrafo 1", ui: { component: "textarea" } },
              { type: "string", name: "paragrafo2", label: "Parágrafo 2", ui: { component: "textarea" } },
              { type: "string", name: "paragrafo3", label: "Parágrafo 3", ui: { component: "textarea" } },
              { type: "string", name: "frase", label: "Frase em destaque (itálico)" },
            ],
          },
          // ---------- COMPARAÇÃO ----------
          {
            type: "object",
            name: "comparacao",
            label: "Seção: Psicoterapia x Visão Sistêmica",
            fields: [
              { type: "string", name: "titulo", label: "Título" },
              { type: "string", name: "subtitulo", label: "Subtítulo" },
              { type: "string", name: "col1Titulo", label: "Coluna 1 — título" },
              { type: "string", name: "col1", label: "Coluna 1 — itens", list: true },
              { type: "string", name: "col2Titulo", label: "Coluna 2 — título" },
              { type: "string", name: "col2", label: "Coluna 2 — itens", list: true },
              { type: "string", name: "fecho", label: "Frase de fechamento (itálico)", ui: { component: "textarea" } },
            ],
          },
          // ---------- JORNADAS ----------
          {
            type: "object",
            name: "jornadas",
            label: "Seção: As Jornadas",
            fields: [
              { type: "string", name: "titulo", label: "Título" },
              { type: "string", name: "subtitulo", label: "Subtítulo" },
              {
                type: "object",
                name: "meditacoes",
                label: "Card — Meditações guiadas",
                fields: [
                  { type: "string", name: "rotulo", label: "Rótulo" },
                  { type: "string", name: "titulo", label: "Título" },
                  { type: "string", name: "texto", label: "Texto", ui: { component: "textarea" } },
                  { type: "string", name: "cta", label: "Texto do link" },
                ],
              },
              {
                type: "object",
                name: "cards",
                label: "Cards das jornadas",
                list: true,
                ui: { itemProps: (i) => ({ label: i?.titulo || "Jornada" }) },
                fields: [
                  { type: "string", name: "num", label: "Numeral (i, ii, iii)" },
                  { type: "string", name: "titulo", label: "Título" },
                  { type: "string", name: "rotulo", label: "Rótulo" },
                  { type: "string", name: "texto", label: "Texto", ui: { component: "textarea" } },
                  { type: "string", name: "preco", label: "Preço / destaque (ex.: R$ 450)" },
                  { type: "string", name: "precoNota", label: "Nota ao lado do preço" },
                  { type: "string", name: "cta", label: "Texto do botão" },
                  { type: "string", name: "mensagem", label: "Mensagem do WhatsApp" },
                ],
              },
            ],
          },
          // ---------- PARA QUEM ----------
          {
            type: "object",
            name: "paraQuem",
            label: "Seção: Para quem é",
            fields: [
              { type: "string", name: "titulo", label: "Título" },
              { type: "string", name: "col1Titulo", label: "Coluna 1 — título" },
              { type: "string", name: "col1", label: "Coluna 1 — itens", list: true },
              { type: "string", name: "col2Titulo", label: "Coluna 2 — título" },
              { type: "string", name: "col2", label: "Coluna 2 — itens", list: true },
            ],
          },
          // ---------- FAQ ----------
          {
            type: "object",
            name: "faq",
            label: "Seção: Perguntas frequentes",
            fields: [
              { type: "string", name: "rotulo", label: "Rótulo" },
              { type: "string", name: "titulo", label: "Título" },
              {
                type: "object",
                name: "itens",
                label: "Perguntas e respostas",
                list: true,
                ui: { itemProps: (i) => ({ label: i?.pergunta || "Pergunta" }) },
                fields: [
                  { type: "string", name: "pergunta", label: "Pergunta" },
                  { type: "string", name: "resposta", label: "Resposta", ui: { component: "textarea" } },
                ],
              },
            ],
          },
          // ---------- EMPRESAS ----------
          {
            type: "object",
            name: "empresas",
            label: "Seção: Empresas e eventos",
            fields: [
              { type: "string", name: "rotulo", label: "Rótulo" },
              { type: "string", name: "titulo", label: "Título" },
              { type: "string", name: "paragrafo", label: "Parágrafo", ui: { component: "textarea" } },
              { type: "string", name: "cta", label: "Texto do botão" },
              { type: "string", name: "mensagem", label: "Mensagem do WhatsApp" },
            ],
          },
          // ---------- CONVITE ----------
          {
            type: "object",
            name: "convite",
            label: "Seção: Convite final",
            fields: [
              { type: "string", name: "rotulo", label: "Rótulo" },
              { type: "string", name: "titulo", label: "Título" },
              { type: "string", name: "paragrafo", label: "Parágrafo", ui: { component: "textarea" } },
              { type: "string", name: "cta", label: "Texto do botão" },
              { type: "string", name: "frase", label: "Frase em destaque (itálico)" },
            ],
          },
          // ---------- RODAPÉ ----------
          {
            type: "object",
            name: "footer",
            label: "Rodapé",
            fields: [
              { type: "string", name: "instagramTexto", label: "Texto do Instagram" },
              { type: "string", name: "instagramUrl", label: "Link do Instagram" },
              { type: "string", name: "copyright", label: "Direitos autorais" },
            ],
          },
          // ---------- CONFIG ----------
          {
            type: "object",
            name: "config",
            label: "Configurações (WhatsApp e Música)",
            fields: [
              { type: "image", name: "musica", label: "Música de fundo (mp3)" },
              { type: "string", name: "whatsapp", label: "WhatsApp (só números, com DDI+DDD, ex.: 5511925027759)" },
              { type: "string", name: "mensagemConversa", label: "Mensagem do botão 'começar uma conversa'", ui: { component: "textarea" } },
              { type: "string", name: "mensagemMeditacoes", label: "Mensagem do botão 'meditações'", ui: { component: "textarea" } },
            ],
          },
        ],
      },
    ],
  },
});
