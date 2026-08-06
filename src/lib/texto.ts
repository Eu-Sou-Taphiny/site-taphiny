/**
 * Renderiza texto do TinaCMS como HTML seguro.
 *
 * FORMATO DO CAMPO — importante, porque é fácil errar:
 * os campos `type: "rich-text"` de uma coleção JSON são gravados pelo Tina como
 * uma **string markdown**, não como árvore. O schema resolvido mostra isso em
 * `parser: { type: "markdown" }`: o editor converte markdown → editor ao abrir e
 * editor → markdown ao salvar. Gravar a árvore pronta no site.json faz o painel
 * exibir literalmente "[object Object]".
 *
 * Então tudo que chega aqui é texto:
 *   · campos de prosa   — markdown escrito pelos botões de Negrito/Itálico/link
 *   · campos curtos e listas de tópicos — texto simples com os marcadores
 *
 * O que é entendido:
 *     **negrito**     _itálico_ ou *itálico*     ++sublinhado++
 *     [texto](link)   \* barra invertida escapa o próximo caractere
 *
 * Sublinhado é marcador porque markdown não tem sublinhado — as marcas que o
 * Tina serializa são bold, italic, code e strikethrough, e `underline` não
 * existe nem na lista de botões dele. `++` não significa nada em markdown,
 * então atravessa o editor intacto e é convertido aqui.
 *
 * A árvore ainda é aceita (função `nos`) como rede de segurança, para um campo
 * que chegue nesse formato não virar "[object Object]" na página.
 *
 * `inline()` devolve HTML SEM tags de bloco, porque no site cada campo já está
 * dentro de um <p>/<li>/<span> com o estilo da seção. Mais de um parágrafo no
 * mesmo campo sai separado por quebra de linha.
 */

type No = {
  type?: string;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strikethrough?: boolean;
  url?: string;
  name?: string;
  children?: No[];
  value?: string;
};

/** Valor de um campo de texto do CMS: string simples ou árvore do rich-text. */
export type Texto = string | { type?: string; children?: No[] } | null | undefined;

function escapa(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Aplica os marcadores num trecho JÁ escapado. */
function marcadores(s: string): string {
  return s
    .replace(/\+\+([^+]+)\+\+/g, '<u>$1</u>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // `*` e `>` entram na borda esquerda (e `*` e `<` na direita) para pegar o
    // itálico dentro do negrito — o Tina grava **_assim_**, e depois da troca do
    // negrito o `_` fica encostado num `>` de tag.
    .replace(/(^|[\s(¿¡"'—–*>-])_([^_\n]+)_(?=[\s.,;:!?)"'—–*<-]|$)/g, '$1<em>$2</em>')
    .replace(/(^|[\s(¿¡"'—–>-])\*([^*\n]+)\*(?=[\s.,;:!?)"'—–<-]|$)/g, '$1<em>$2</em>');
}

/**
 * Um parágrafo de markdown → HTML inline.
 *
 * A ordem importa. Escapa o HTML primeiro, então nada que este código insere
 * depois volta a ser escapado. Depois guarda os trechos que NÃO podem passar
 * pelas expressões de formatação — o que vem após uma barra invertida e as URLs
 * dos links — em fichas, e devolve no fim. Sem isso, um `_` dentro de uma URL
 * viraria itálico e quebraria o link.
 */
// Delimitador das fichas. Escrito como escape, e não como o byte cru, porque
// byte invisível em código-fonte some sem avisar num copiar e colar.
const SEP = '\u0001';

function paragrafo(txt: string): string {
  const guardados: string[] = [];
  const ficha = (valor: string) => {
    guardados.push(valor);
    return SEP + (guardados.length - 1) + SEP;
  };

  // tira o delimitador da entrada antes de usá-lo: o conteúdo não manda aqui
  let h = escapa(txt.split(SEP).join(''));

  // \* \_ \[ … : o caractere seguinte é literal, não marcação
  h = h.replace(/\\([\\`*_{}[\]()#+\-.!~<>|])/g, (_m, c) => ficha(c));

  // [texto](url) — a URL vai para ficha; o texto continua solto para poder
  // receber negrito e itálico normalmente
  h = h.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_m, texto, url) => {
    const externo = /^https?:\/\//i.test(url);
    const extra = externo ? ' target="_blank" rel="noopener"' : '';
    return ficha('<a href="' + url + '"' + extra + '>') + texto + ficha('</a>');
  });

  h = marcadores(h);

  // linha simples é continuação do mesmo parágrafo, como em markdown
  h = h.replace(/\n+/g, ' ');

  return h.replace(new RegExp(SEP + '(\\d+)' + SEP, 'g'), (_m, i) => guardados[Number(i)]);
}

function textoSimples(s: string): string {
  return s
    .split(/\n{2,}/)
    .map((p) => paragrafo(p.trim()))
    .filter((p) => p !== '')
    .join('<br>');
}

/** Nós de texto do rich-text, com as marcas que o Tina grava. */
function folha(no: No): string {
  let h = textoSimples(no.text || '');
  if (no.code) h = `<code>${h}</code>`;
  if (no.strikethrough) h = `<s>${h}</s>`;
  if (no.italic) h = `<em>${h}</em>`;
  if (no.bold) h = `<strong>${h}</strong>`;
  return h;
}

function filhos(no: No): string {
  return (no.children || []).map(nos).join('');
}

function nos(no: No): string {
  if (!no || typeof no !== 'object') return '';
  switch (no.type) {
    case 'text':
      return folha(no);
    case 'br':
      return '<br>';
    case 'a': {
      const url = escapa(no.url || '');
      const externo = /^https?:\/\//i.test(no.url || '');
      const extra = externo ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${url}"${extra}>${filhos(no)}</a>`;
    }
    // blocos: no site o campo já vive dentro de um <p>/<li>, então cada bloco
    // extra vira só uma quebra de linha em vez de abrir outra tag de bloco.
    case 'p':
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
    case 'blockquote':
    case 'li':
    case 'lic':
      return filhos(no);
    case 'ul':
    case 'ol':
      return (no.children || []).map((li) => nos(li)).join('<br>');
    case 'code_block':
      return `<code>${escapa(no.value || '')}</code>`;
    case 'hr':
      return '';
    default:
      // tipo desconhecido (ex.: componente customizado): tenta o conteúdo dele
      return no.children ? filhos(no) : no.text ? folha(no) : '';
  }
}

/** HTML inline do campo, pra usar com set:html dentro do <p>/<li> que já existe. */
export function inline(valor: Texto): string {
  if (valor == null) return '';
  if (typeof valor === 'string') return textoSimples(valor);
  const blocos = valor.children || [];
  return blocos
    .map((b) => nos(b))
    .filter((h) => h !== '')
    .join('<br>');
}

/** Junta o texto dos nós, inserindo espaço entre blocos. */
function colhe(no: No): string {
  if (!no || typeof no !== 'object') return '';
  if (no.type === 'text') return no.text || '';
  if (no.type === 'br') return ' ';
  if (no.type === 'code_block') return no.value || '';
  const dentro = (no.children || []).map(colhe).join('');
  const bloco = no.type && /^(p|h[1-6]|blockquote|li|ul|ol|lic)$/.test(no.type);
  return bloco ? dentro + ' ' : dentro;
}

/** Texto puro, sem tag nenhuma — pra <title>, meta tags e alt de imagem. */
export function puro(valor: Texto): string {
  if (valor == null) return '';
  const bruto = typeof valor === 'string' ? valor : (valor.children || []).map(colhe).join(' ');
  return bruto
    .replace(/\\([\\`*_{}[\]()#+\-.!~<>|])/g, '$1')     // desfaz os escapes
    .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, '$1')        // link vira só o texto
    .replace(/\+\+([^+]+)\+\+/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[\s(¿¡"'—–*>-])[_*]([^_*\n]+)[_*](?=[\s.,;:!?)"'—–*<-]|$)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}
