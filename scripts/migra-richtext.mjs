/**
 * Deixa os campos de PROSA do site.json no formato que o rich-text do TinaCMS
 * realmente usa numa coleção JSON: **string markdown**.
 *
 * Por que isso importa: é fácil supor que um campo `type: "rich-text"` guarda a
 * árvore (AST) pronta dentro do JSON. Não guarda. O schema resolvido traz
 * `parser: { type: "markdown" }` — o editor converte markdown → editor ao abrir
 * e editor → markdown ao salvar. Gravar a árvore faz o painel mostrar
 * literalmente "[object Object]" na caixa, e salvar por cima destrói o texto.
 *
 * Este script aceita os dois formatos na entrada e sempre grava string:
 *   · árvore  → serializa de volta para markdown (**negrito**, _itálico_, links)
 *   · string  → deixa como está
 *
 * Ficam de fora, de propósito:
 *   · títulos, rótulos, botões, preços, mensagens de WhatsApp e SEO — negrito num
 *     rótulo em caixa alta ou numa mensagem de WhatsApp não faz sentido;
 *   · as listas de tópicos (comparacao.col1/col2, paraQuem.col1/col2) — o Tina
 *     não aceita `list: true` em rich-text. Nelas a formatação sai pelos
 *     marcadores, que o renderizador (src/lib/texto.ts) entende igual.
 *
 * Rodar:  node scripts/migra-richtext.mjs
 * É idempotente.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ARQ = 'src/content/site.json';

// caminhos de prosa; `[]` significa "cada item da lista"
const CAMPOS = [
  'hero.paragrafo',
  'hero.frase',
  'provocacao.paragrafo1',
  'provocacao.paragrafo2',
  'visao.definicao',
  'visao.paragrafo',
  'visao.pilares[].texto',
  'quemConduz.paragrafo1',
  'quemConduz.paragrafo2',
  'quemConduz.paragrafo3',
  'quemConduz.frase',
  'comparacao.subtitulo',
  'comparacao.fecho',
  'jornadas.subtitulo',
  'jornadas.meditacoes.texto',
  'jornadas.cards[].texto',
  'jornadas.cards[].resultado',
  'faq.itens[].resposta',
  'empresas.paragrafo',
  'convite.paragrafo',
  'convite.frase',
  'popup.texto',
];

/** escapa o que viraria marcação sem querer ao voltar para markdown */
function escapaMd(t) {
  return String(t).replace(/([\\*_[\]`])/g, '\\$1');
}

/** nó inline da árvore → markdown */
function inlineMd(no) {
  if (!no || typeof no !== 'object') return '';
  if (no.type === 'text') {
    let t = escapaMd(no.text || '');
    if (!t) return '';
    if (no.code) t = '`' + t + '`';
    if (no.strikethrough) t = '~~' + t + '~~';
    if (no.italic) t = '_' + t + '_';
    if (no.bold) t = '**' + t + '**';
    return t;
  }
  if (no.type === 'br') return '\n';
  if (no.type === 'a') return '[' + (no.children || []).map(inlineMd).join('') + '](' + (no.url || '') + ')';
  return (no.children || []).map(inlineMd).join('');
}

/** árvore inteira → markdown (um bloco por parágrafo) */
function arvoreParaMd(v) {
  const blocos = (v.children || []).map((b) => {
    if (b && b.type === 'ul') return (b.children || []).map((li) => '- ' + inlineMd(li)).join('\n');
    if (b && b.type === 'ol') return (b.children || []).map((li, i) => `${i + 1}. ` + inlineMd(li)).join('\n');
    return inlineMd(b);
  });
  return blocos.map((b) => b.trim()).filter(Boolean).join('\n\n');
}

function aplica(obj, partes) {
  const [atual, ...resto] = partes;

  if (atual.endsWith('[]')) {
    const lista = obj?.[atual.slice(0, -2)];
    if (!Array.isArray(lista)) return 0;
    return lista.reduce((n, item) => n + aplica(item, resto), 0);
  }
  if (resto.length) return obj?.[atual] ? aplica(obj[atual], resto) : 0;

  const v = obj?.[atual];
  if (v == null || v === '') return 0;
  if (typeof v === 'string') return 0;          // já é string: nada a fazer
  obj[atual] = arvoreParaMd(v);
  return 1;
}

const dados = JSON.parse(readFileSync(ARQ, 'utf8'));
let total = 0;
for (const caminho of CAMPOS) {
  const n = aplica(dados, caminho.split('.'));
  total += n;
  console.log(`${n ? '✓' : '·'} ${caminho}${n > 1 ? ` (${n} itens)` : n ? '' : ' — já era string ou está vazio'}`);
}

writeFileSync(ARQ, JSON.stringify(dados, null, 2) + '\n');
console.log(`\n${total} campo(s) convertido(s) para string markdown em ${ARQ}`);
