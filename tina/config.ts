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

// Lista de itens com título e texto (cartões, etapas): ela adiciona, remove
// e reordena pelo painel.
const itens = (name: string, label: string, rotuloItem: string, description?: string) => ({
  type: "object" as const,
  name,
  label,
  description,
  list: true,
  ui: { itemProps: (i: any) => ({ label: i?.titulo || rotuloItem }) },
  fields: [
    { type: "string" as const, name: "titulo", label: "Título" },
    prosa("texto", "Texto"),
  ],
});

// Chave "Exibir no site", a mesma do pop-up. Vai como primeiro campo de cada
// seção. Desligada, a seção some da página, do menu do rodapé e do breadcrumb
// do Google. Conteúdo antigo sem o campo conta como ligado (ver src/lib/jsonld.ts).
const exibir = {
  type: "boolean" as const,
  name: "exibir",
  label: "Exibir no site",
  description: "Ligado: a seção aparece. Desligado: some da página e do menu do rodapé, sem apagar o texto.",
};

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
              prosa("frase", "Frase em destaque (citação)"),
              { type: "string", name: "cta", label: "Texto do botão" },
            ],
          },
          // ---------- AUTOCONSCIÊNCIA ----------
          {
            type: "object",
            name: "provocacao",
            label: "Seção: Autoconsciência (Por que fazemos o que fazemos?)",
            fields: [
              exibir,
              { type: "string", name: "rotulo", label: "Rótulo (linha pequena)" },
              { type: "string", name: "titulo", label: "Título" },
              prosa("abertura", "Texto de abertura"),
              { type: "string", name: "col1Titulo", label: "Contraste: coluna 1 (clara), título" },
              prosa("col1Texto", "Contraste: coluna 1, texto"),
              { type: "string", name: "col2Titulo", label: "Contraste: coluna 2 (escura, em destaque), título" },
              prosa("col2Texto", "Contraste: coluna 2, texto"),
              { type: "string", name: "pilaresTitulo", label: "Subtítulo dos cards numerados" },
              itens("pilares", "Cards numerados", "Card", "A numeração (01, 02, 03...) segue a ordem da lista."),
              prosa("fecho", "Frase de fechamento em destaque"),
            ],
          },
          // ---------- MINHA ABORDAGEM ----------
          {
            type: "object",
            name: "abordagem",
            label: "Seção: Minha abordagem",
            fields: [
              exibir,
              { type: "string", name: "rotulo", label: "Rótulo (linha pequena)" },
              { type: "string", name: "titulo", label: "Título" },
              prosa("abertura", "Texto de abertura"),
              { type: "string", name: "chipsTitulo", label: "Título dos chips (ex.: Para qualquer área da vida)" },
              { type: "string", name: "chips", label: "Chips (um por item)", list: true },
              prosa("destaque", "Bloco em destaque"),
              { type: "string", name: "etapasTitulo", label: "Título da linha do tempo" },
              itens("etapas", "Linha do tempo: etapas", "Etapa", "A numeração segue a ordem da lista. Horizontal no computador, vertical no celular."),
              prosa("fecho", "Frase de fechamento"),
            ],
          },
          // ---------- VISÃO SISTÊMICA ----------
          {
            type: "object",
            name: "visao",
            label: "Seção: O que é a Visão Sistêmica",
            fields: [
              exibir,
              { type: "string", name: "rotulo", label: "Rótulo" },
              { type: "string", name: "titulo", label: "Título" },
              prosa("abertura", "Texto de abertura"),
              { type: "string", name: "col1Titulo", label: "Coluna 1 (clara), título (ex.: O que ela não é)" },
              { type: "string", name: "col1", label: "Coluna 1, itens", list: true, description: DICA_LISTA },
              { type: "string", name: "col2Titulo", label: "Coluna 2 (escura, em destaque), título (ex.: O que ela faz)" },
              { type: "string", name: "col2", label: "Coluna 2, itens", list: true, description: DICA_LISTA },
              {
                type: "object",
                name: "pilares",
                label: "Pilares (Pertencimento / Ordem / Equilíbrio)",
                description: "Cartões coloridos, na ordem: terracota, ouro, bordeaux. Mantenha os textos curtos.",
                list: true,
                ui: { itemProps: (i) => ({ label: i?.titulo || "Pilar" }) },
                fields: [
                  { type: "string", name: "titulo", label: "Título do pilar" },
                  prosa("texto", "Texto"),
                ],
              },
              prosa("destaque", "Frase em destaque grande"),
              prosa("fecho", "Texto de fechamento"),
            ],
          },
          // ---------- QUEM CONDUZ ----------
          {
            type: "object",
            name: "quemConduz",
            label: "Seção: Quem conduz (foto/vídeo)",
            fields: [
              exibir,
              { type: "image", name: "foto", label: "Foto (4:5) — deixe vazio se for usar vídeo" },
              { type: "image", name: "video", label: "Vídeo (mp4) — deixe vazio se for usar foto" },
              { type: "image", name: "videoCapa", label: "Capa do vídeo (opcional)" },
              { type: "string", name: "rotulo", label: "Rótulo" },
              { type: "string", name: "titulo", label: "Título (itálico)" },
              {
                type: "string",
                name: "trajetoria",
                label: "Linha do tempo da trajetória (um passo por item)",
                list: true,
                description: "O último item aparece como o ponto de hoje, com destaque. " + DICA_LISTA,
              },
              prosa("texto", "Texto"),
              prosa("destaque", "Frase em destaque"),
              prosa("frase", "Citação (fecha a seção)"),
            ],
          },
          // ---------- COMPARAÇÃO ----------
          {
            type: "object",
            name: "comparacao",
            label: "Seção: Psicoterapia x Visão Sistêmica",
            fields: [
              exibir,
              { type: "string", name: "titulo", label: "Título" },
              prosa("subtitulo", "Subtítulo"),
              { type: "string", name: "col1Titulo", label: "Coluna 1 — título" },
              { type: "string", name: "col1", label: "Coluna 1 — itens", list: true, description: DICA_LISTA },
              { type: "string", name: "col2Titulo", label: "Coluna 2 — título" },
              { type: "string", name: "col2", label: "Coluna 2 — itens", list: true, description: DICA_LISTA },
              prosa("fecho", "Frase de fechamento"),
            ],
          },
          // ---------- CONSTELAÇÃO INTERATIVA ----------
          {
            type: "object",
            name: "constelacao",
            label: "Seção: Constelação interativa (Experimente)",
            fields: [
              exibir,
              { type: "string", name: "rotulo", label: "Rótulo" },
              { type: "string", name: "titulo", label: "Título" },
              prosa("dica", "Instrução (acima das bolinhas)"),
              prosa("fim", "Frase que aparece quando todos estão no lugar"),
              { type: "string", name: "botaoReordenar", label: "Texto do botão Reordenar" },
              { type: "string", name: "botaoRecomecar", label: "Texto do botão Começar de novo" },
              // vídeo ao lado das bolinhas; tudo vazio = seção como sempre foi
              {
                type: "string",
                name: "videoUrl",
                label: "Vídeo: link do YouTube ou Vimeo (opcional)",
                description: "Cole o link do vídeo. Se preencher o link, ele vale mais que o arquivo abaixo. Deixe link e arquivo vazios para a seção ficar sem vídeo.",
              },
              { type: "image", name: "video", label: "Vídeo: arquivo mp4 (opcional, se não usar link)" },
              { type: "image", name: "videoCapa", label: "Capa do vídeo (opcional)" },
              {
                type: "string",
                name: "videoFormato",
                label: "Formato do vídeo",
                options: [
                  { value: "horizontal", label: "Horizontal (16:9)" },
                  { value: "vertical", label: "Vertical (9:16, gravado no celular)" },
                  { value: "retrato", label: "Retrato (4:5)" },
                ],
              },
            ],
          },
          // ---------- JORNADAS ----------
          {
            type: "object",
            name: "jornadas",
            label: "Seção: As Jornadas",
            fields: [
              exibir,
              { type: "string", name: "titulo", label: "Título" },
              prosa("subtitulo", "Subtítulo"),
              {
                type: "object",
                name: "cards",
                label: "Produtos (sessões e jornadas)",
                description:
                  "Cada item é um produto, todos com o mesmo layout. Para criar um novo, use o + e preencha os campos. A ordem da lista define a numeração (i, ii, iii, iv...) e a posição na trilha; arraste para reordenar. Produto novo também entra sozinho no Google (dados estruturados).",
                list: true,
                ui: {
                  itemProps: (i) => ({ label: i?.titulo || "Novo produto" }),
                  defaultItem: () => ({
                    titulo: "Novo produto",
                    resultadoRotulo: "Resultado esperado",
                    precoNota: "consulte valores e disponibilidade",
                    cta: "Saber mais",
                    mensagem: "Olá, Taphiny! Vim pelo site e gostaria de saber mais sobre este produto.",
                  }),
                },
                fields: [
                  { type: "string", name: "titulo", label: "Título" },
                  { type: "string", name: "rotulo", label: "Rótulo" },
                  prosa("texto", "Texto"),
                  { type: "string", name: "resultadoRotulo", label: "Rótulo do resultado (padrão: Resultado esperado)" },
                  prosa("resultado", "Resultado esperado (opcional)"),
                  { type: "string", name: "preco", label: "Preço / destaque (ex.: R$ 450,00 ou 4 Encontros)" },
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
              exibir,
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
              exibir,
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
              exibir,
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
              prosa("frase", "Frase em destaque (citação)"),
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
              // Outras redes: o ícone só aparece no rodapé com o link preenchido,
              // e o link preenchido também entra no Google (sameAs do JSON-LD).
              { type: "string", name: "facebookUrl", label: "Link do Facebook (opcional)", description: "Deixe vazio para não mostrar o ícone." },
              { type: "string", name: "tiktokUrl", label: "Link do TikTok (opcional)", description: "Deixe vazio para não mostrar o ícone." },
              { type: "string", name: "threadsUrl", label: "Link do Threads (opcional)", description: "Deixe vazio para não mostrar o ícone." },
              { type: "string", name: "copyright", label: "Direitos autorais" },
            ],
          },
          // ---------- CONFIG ----------
          {
            type: "object",
            name: "config",
            label: "Configurações (WhatsApp e Música)",
            fields: [
              {
                type: "boolean",
                name: "secoesFechadas",
                label: "Deixar as seções fechadas (a pessoa abre a que quiser)",
                description:
                  "Ligado: as seções longas viram sanfona e só 'As Jornadas' fica aberta. O topo e o convite final continuam sempre visíveis.",
              },
              { type: "image", name: "musica", label: "Música de fundo (mp3)" },
              { type: "string", name: "whatsapp", label: "WhatsApp (só números, com DDI+DDD, ex.: 5511925027759)" },
              { type: "string", name: "mensagemConversa", label: "Mensagem do botão 'começar uma conversa'", ui: { component: "textarea" } },
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
