import { defineConfig } from "tinacms";

// Branch/credenciais vêm de variáveis de ambiente (ver .env.example).
const branch =
  process.env.TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

// ---------------------------------------------------------------------------
// Campos de PROSA (rich-text): a caixa vem com botões de Negrito e Itálico.
//
// Sublinhado não tem botão porque o rich-text do Tina é markdown, e markdown não
// tem sublinhado (as marcas que ele grava são bold, italic, code e
// strikethrough). Para sublinhar, escreve-se ++assim++ no meio do texto, e o
// renderizador do site (src/lib/texto.ts) converte pra <u>.
//
// A barra é enxuta de propósito: dentro de um parágrafo do site não faz sentido
// oferecer título, imagem, tabela ou bloco de código.
// ---------------------------------------------------------------------------
const DICA = "Negrito e itálico nos botões da caixa. Para sublinhar, escreva ++assim++.";

const prosa = (name: string, label: string, dica: string = DICA) => ({
  type: "rich-text" as const,
  name,
  label,
  description: dica,
  overrides: { toolbar: ["bold", "italic", "link"], showEmbed: false },
});

// Listas de tópicos continuam texto simples: o Tina não aceita `list: true` em
// rich-text, e virar um cartão por tópico pioraria a edição. Nelas a formatação
// sai pelos marcadores, que o renderizador entende igual.
const DICA_LISTA = "Um tópico por linha. Formatação: **negrito**, _itálico_, ++sublinhado++.";

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
              prosa("paragrafo", "Parágrafo"),
              prosa("frase", "Frase em destaque (itálico)"),
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
              prosa("paragrafo1", "Parágrafo 1"),
              prosa("paragrafo2", "Parágrafo 2"),
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
              prosa("definicao", "Definição (1º parágrafo)"),
              prosa("paragrafo", "Parágrafo complementar"),
              {
                type: "object",
                name: "pilares",
                label: "Pilares (Pertencer / Ordenar / Fluir)",
                list: true,
                ui: { itemProps: (i) => ({ label: i?.titulo || "Pilar" }) },
                fields: [
                  { type: "string", name: "titulo", label: "Título do pilar" },
                  prosa("texto", "Texto"),
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
              prosa("paragrafo1", "Parágrafo 1"),
              prosa("paragrafo2", "Parágrafo 2"),
              prosa("paragrafo3", "Parágrafo 3"),
              prosa("frase", "Frase em destaque (itálico)"),
            ],
          },
          // ---------- COMPARAÇÃO ----------
          {
            type: "object",
            name: "comparacao",
            label: "Seção: Psicoterapia x Visão Sistêmica",
            fields: [
              { type: "string", name: "titulo", label: "Título" },
              prosa("subtitulo", "Subtítulo"),
              { type: "string", name: "col1Titulo", label: "Coluna 1 — título" },
              { type: "string", name: "col1", label: "Coluna 1 — itens", list: true, description: DICA_LISTA },
              { type: "string", name: "col2Titulo", label: "Coluna 2 — título" },
              { type: "string", name: "col2", label: "Coluna 2 — itens", list: true, description: DICA_LISTA },
              prosa("fecho", "Frase de fechamento"),
            ],
          },
          // ---------- JORNADAS ----------
          {
            type: "object",
            name: "jornadas",
            label: "Seção: As Jornadas",
            fields: [
              { type: "string", name: "titulo", label: "Título" },
              prosa("subtitulo", "Subtítulo"),
              {
                type: "object",
                name: "meditacoes",
                label: "Card — Meditações guiadas",
                fields: [
                  { type: "string", name: "rotulo", label: "Rótulo" },
                  { type: "string", name: "titulo", label: "Título" },
                  { type: "string", name: "subtitulo", label: "Subtítulo em destaque (opcional)" },
                  prosa("texto", "Texto"),
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
                  prosa("texto", "Texto"),
                  { type: "string", name: "resultadoRotulo", label: "Rótulo do resultado (padrão: Resultado esperado)" },
                  prosa("resultado", "Resultado esperado (opcional)"),
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
              { type: "string", name: "col1", label: "Coluna 1 — itens", list: true, description: DICA_LISTA },
              { type: "string", name: "col2Titulo", label: "Coluna 2 — título" },
              { type: "string", name: "col2", label: "Coluna 2 — itens", list: true, description: DICA_LISTA },
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
                  prosa("resposta", "Resposta"),
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
              prosa("paragrafo", "Parágrafo"),
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
              prosa("paragrafo", "Parágrafo"),
              { type: "string", name: "cta", label: "Texto do botão" },
              prosa("frase", "Frase em destaque (itálico)"),
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
          // ---------- POP-UP DE ENTRADA ----------
          {
            type: "object",
            name: "popup",
            label: "Pop-up de entrada",
            fields: [
              { type: "boolean", name: "ativo", label: "Ativar pop-up (liga/desliga)" },
              { type: "string", name: "titulo", label: "Título" },
              { type: "string", name: "subtitulo", label: "Subtítulo em destaque (opcional)" },
              prosa("texto", "Texto"),
              { type: "image", name: "imagem", label: "Imagem (opcional)" },
              { type: "string", name: "botaoTexto", label: "Texto do botão (opcional)" },
              { type: "string", name: "botaoLink", label: "Link do botão (opcional — ex.: link do WhatsApp)" },
            ],
          },
        ],
      },
      // ============================================================
      // COLEÇÃO: BLOG (artigos em markdown, um arquivo por post)
      // ============================================================
      {
        name: "blog",
        label: "Blog",
        path: "src/content/blog",
        format: "md",
        ui: {
          // gera o nome do arquivo (slug) a partir do título ao criar o post
          filename: {
            slugify: (values) =>
              (values?.titulo || "post")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, ""),
          },
        },
        fields: [
          { type: "string", name: "titulo", label: "Título", isTitle: true, required: true },
          { type: "datetime", name: "data", label: "Data de publicação", required: true },
          { type: "image", name: "capa", label: "Imagem de capa" },
          { type: "string", name: "resumo", label: "Resumo (aparece na listagem e no Google)", ui: { component: "textarea" } },
          { type: "boolean", name: "publicado", label: "Publicado (desmarque para deixar como rascunho)" },
          { type: "rich-text", name: "corpo", label: "Conteúdo do post", isBody: true },
        ],
      },
    ],
  },
});
