/**
 * Renderiza texto do TinaCMS como HTML seguro.
 *
 * Dois formatos entram aqui, e o mesmo resultado sai:
 *
 *  1. rich-text  — os campos de parágrafo viraram `type: "rich-text"` no Tina, e
 *     a Taphiny formata clicando em Negrito/Itálico. O Tina grava uma árvore
 *     (AST) dentro do site.json.
 *  2. string     — campos curtos e listas de tópicos continuam texto simples,
 *     onde a formatação é escrita com marcadores.
 *
 * Marcadores (valem nos dois formatos):
 *     **negrito**      _itálico_      ++sublinhado++
 *
 * O sublinhado só existe como marcador porque o rich-text do Tina é baseado em
 * markdown, e markdown não tem sublinhado — as marcas que ele serializa são
 * bold, italic, code e strikethrough. `++` não significa nada em markdown, então
 * atravessa o editor intacto e é convertido aqui.
 *
 * `inline()` devolve HTML SEM tags de bloco, porque no site cada campo já está
 * dentro de um <p>/<li>/<span> com o estilo da seção. Se a autora criar mais de
 * um parágrafo no mesmo campo, eles saem separados por quebra de linha.
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
    .replace(/(^|[\s(¿¡"'—–-])_([^_\n]+)_(?=[\s.,;:!?)"'—–-]|$)/g, '$1<em>$2</em>')
    .replace(/(^|[\s(¿¡"'—–-])\*([^*\n]+)\*(?=[\s.,;:!?)"'—–-]|$)/g, '$1<em>$2</em>');
}

function textoSimples(s: string): string {
  return marcadores(escapa(s));
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
    .replace(/\+\+([^+]+)\+\+/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[\s(¿¡"'—–-])[_*]([^_*\n]+)[_*](?=[\s.,;:!?)"'—–-]|$)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}
