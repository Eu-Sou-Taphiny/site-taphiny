/**
 * Converte os campos de PROSA do site.json de texto simples para a árvore
 * (AST) do rich-text do TinaCMS, que é o formato que o editor com botões de
 * Negrito/Itálico grava.
 *
 * Só os campos de prosa mudam. Ficam como texto simples, de propósito:
 *   · títulos, rótulos, textos de botão, preços, mensagens de WhatsApp e SEO
 *     — negrito num rótulo em caixa alta ou numa mensagem de WhatsApp não faz
 *     sentido, e rich-text ali só atrapalharia a edição;
 *   · as listas de tópicos (comparacao.col1/col2, paraQuem.col1/col2) — o Tina
 *     não aceita `list: true` em rich-text, e transformar cada tópico num
 *     cartão separado pra editar pioraria o painel. Nessas a formatação sai
 *     pelos marcadores **negrito** / _itálico_ / ++sublinhado++, que o
 *     renderizador (src/lib/texto.ts) entende igual.
 *
 * Rodar:  node scripts/migra-richtext.mjs
 * É idempotente: campo já convertido é deixado em paz.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ARQ = 'src/content/site.json';

// caminhos a converter; `[]` significa "cada item da lista"
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

/** texto simples -> árvore do rich-text (um parágrafo por linha dupla) */
function paraArvore(txt) {
  const paragrafos = String(txt)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const blocos = (paragrafos.length ? paragrafos : ['']).map((p) => ({
    type: 'p',
    children: [{ type: 'text', text: p }],
  }));
  return { type: 'root', children: blocos };
}

function aplica(obj, partes, caminho) {
  const [atual, ...resto] = partes;

  if (atual.endsWith('[]')) {
    const chave = atual.slice(0, -2);
    const lista = obj?.[chave];
    if (!Array.isArray(lista)) return 0;
    return lista.reduce((n, item) => n + aplica(item, resto, caminho), 0);
  }

  if (resto.length) return obj?.[atual] ? aplica(obj[atual], resto, caminho) : 0;

  const v = obj?.[atual];
  if (v == null || v === '') return 0;
  if (typeof v !== 'string') return 0; // já é árvore: não mexe
  obj[atual] = paraArvore(v);
  return 1;
}

const dados = JSON.parse(readFileSync(ARQ, 'utf8'));
let total = 0;
for (const caminho of CAMPOS) {
  const n = aplica(dados, caminho.split('.'), caminho);
  total += n;
  console.log(`${n ? '✓' : '·'} ${caminho}${n > 1 ? ` (${n} itens)` : n ? '' : ' — vazio ou já convertido'}`);
}

writeFileSync(ARQ, JSON.stringify(dados, null, 2) + '\n');
console.log(`\n${total} campo(s) convertido(s) em ${ARQ}`);
