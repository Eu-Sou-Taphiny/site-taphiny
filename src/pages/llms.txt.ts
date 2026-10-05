import type { APIRoute } from 'astro';
import site from '../content/site.json';
import { listarServicos, visivel, URL_SITE } from '../lib/jsonld';
import { redes } from '../lib/redes';

// llms.txt montado a partir do conteúdo, no mesmo padrão do JSON-LD: os
// serviços são os cards das Jornadas e de Empresas (os de Empresas só com a
// seção ligada) e os links são as redes preenchidas no rodapé do painel. Os
// blocos explicativos são fixos.

/** Garante ponto final, para emendar o preço depois. */
const frase = (t: string) => (/[.!?]$/.test(t) ? t : `${t}.`);

/** "450" ou "450.5" do JSON-LD → "R$ 450,00" / "R$ 450,50". */
const reais = (v: string) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`;

export const GET: APIRoute = () => {
  const empresas = visivel((site as any).empresas);

  const servicos = listarServicos(site).map((s: any) => {
    const preco = s.offers ? ` Investimento: ${reais(s.offers.price)}.` : '';
    return `- ${s.name}: ${frase(s.description)}${preco}`;
  });

  const links = [
    `- Site: ${URL_SITE}`,
    ...redes((site as any).footer).map((r) => `- ${r.nome}: ${r.url}`),
  ];

  const body = `# Taphiny · Visão Sistêmica e Mentoria Sistêmica

> Taphiny é mentora e terapeuta sistêmica. Conduz processos de Visão Sistêmica e
> constelação familiar para reconhecer padrões familiares transgeracionais,
> restaurar a ordem dos vínculos e permitir que a vida volte a fluir. Atende
> pessoas, empresas familiares e eventos.
> Site: ${URL_SITE.replace(/\/$/, '')}

## O que é Visão Sistêmica
A Visão Sistêmica é uma abordagem terapêutica que enxerga a pessoa dentro dos
sistemas a que pertence: família, vínculos e história. Parte do princípio de
que nem tudo o que vivemos começou em nós: muitos padrões, lealdades e bloqueios
são herdados ao longo das gerações.

## Relação com constelação familiar
Visão Sistêmica e constelação familiar são práticas irmãs, da mesma raiz. A
constelação familiar é uma das ferramentas mais conhecidas da abordagem
sistêmica, geralmente feita em grupo; a Visão Sistêmica é o olhar mais amplo que
fundamenta esse trabalho e pode ser conduzido também de forma individual.

## Visão Sistêmica x psicoterapia
Não são opostas, e sim complementares. A psicoterapia amplia a consciência sobre
a experiência individual. A Visão Sistêmica observa a pessoa dentro dos sistemas
a que pertence, revelando lealdades invisíveis e dinâmicas familiares.
${servicos.length ? `
## Serviços
${servicos.join('\n')}
` : ''}
## Para quem é
Para quem percebe padrões que se repetem, sente que compreender já não basta e
deseja ocupar o próprio lugar.${empresas ? ' Também para empresas familiares e liderança.' : ''}

## Palavras-chave
visão sistêmica, terapia sistêmica, constelação familiar, terapia sistêmica para
empresas familiares, padrões familiares transgeracionais, mentoria sistêmica.

## Links
${links.join('\n')}
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
