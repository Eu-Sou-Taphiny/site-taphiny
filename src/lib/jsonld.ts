// Dados estruturados (schema.org / JSON-LD) da home.
//
// Montados a partir do conteúdo, e não escritos à mão no HTML, para acompanhar o
// painel: seção desligada sai do breadcrumb (e o FAQ sai inteiro), e os serviços
// de negócios só entram enquanto a seção Empresas estiver no ar.

import { puro } from './texto';
import { perfis } from './redes';

export const URL_SITE = 'https://eusoutaphiny.com.br/';
const id = (frag: string) => `${URL_SITE}#${frag}`;

const slug = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Seção ligada? Campo ausente (conteúdo antigo) conta como ligada. */
export const visivel = (secao: any) => secao?.exibir !== false;

export function montarJsonLd(site: any) {
  const { visao, jornadas, faq, empresas, footer } = site;
  // perfis preenchidos no rodapé do painel (Instagram e as redes com ícone)
  const sameAs = perfis(footer);

  const servicosNegocios = visivel(empresas) ? [
    { '@type': 'Service', '@id': id('servico-negocios'), name: 'Terapias para Negócios', serviceType: 'Terapia Sistêmica para empresas familiares', description: 'Visão Sistêmica aplicada a empresas familiares, relação entre sócios, liderança e equipes, trabalhando pertencimento, cultura e prosperidade.', provider: { '@id': id('business') }, areaServed: 'BR' },
    { '@type': 'Service', '@id': id('servico-workshops'), name: 'Workshops & Palestras', serviceType: 'Terapia Sistêmica', description: 'Workshops e palestras sobre Visão Sistêmica, pertencimento, cultura e prosperidade para empresas e eventos.', provider: { '@id': id('business') }, areaServed: 'BR' },
  ] : [];

  // Um Service por card de produto: produto novo no painel entra no SEO sozinho.
  // Preço só vai quando o campo é um valor em reais (ex.: "R$ 450,00").
  const servicos = [
    ...(visivel(jornadas) ? jornadas?.cards || [] : []).map((c: any) => {
      const valor = String(c.preco || '').match(/R\$\s*([\d.]+)(?:,(\d{2}))?/);
      const preco = valor ? `${valor[1].replace(/\./g, '')}${valor[2] && valor[2] !== '00' ? '.' + valor[2] : ''}` : '';
      return {
        '@type': 'Service', '@id': id(`servico-${slug(c.titulo || 'produto')}`),
        name: c.titulo, serviceType: 'Terapia Sistêmica',
        description: [c.rotulo, puro(c.texto)].filter(Boolean).join('. '),
        provider: { '@id': id('business') }, areaServed: 'BR',
        ...(preco ? { offers: { '@type': 'Offer', price: preco, priceCurrency: 'BRL' } } : {}),
      };
    }),
    ...servicosNegocios,
  ];

  const oferta = (s: any) => ({
    '@type': 'Offer',
    itemOffered: { '@id': s['@id'] },
    ...(s.offers ? { price: s.offers.price, priceCurrency: s.offers.priceCurrency } : {}),
  });

  const trilha = [
    { name: 'Início', item: URL_SITE },
    visivel(visao) && { name: 'Visão Sistêmica', item: id('visao-sistemica') },
    visivel(jornadas) && { name: 'As Jornadas', item: id('jornadas') },
    visivel(faq) && { name: 'Perguntas Frequentes', item: id('faq') },
  ].filter(Boolean) as { name: string; item: string }[];

  // Perguntas e respostas saem do FAQ do painel (texto puro, sem marcação).
  const perguntas = (faq?.itens || []).filter((q: any) => q?.pergunta && puro(q.resposta));
  const faqPage = visivel(faq) && perguntas.length ? [{ '@type': 'FAQPage', '@id': id('faq'), mainEntity:
    perguntas.map((q: any) => ({ '@type': 'Question', name: q.pergunta, acceptedAnswer: { '@type': 'Answer', text: puro(q.resposta) } })),
  }] : [];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': id('website'), url: URL_SITE, name: 'Taphiny · Visão Sistêmica', description: 'Visão Sistêmica, terapia sistêmica e constelação familiar com Taphiny.', inLanguage: 'pt-BR', publisher: { '@id': id('business') }, potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${URL_SITE}?s={search_term_string}` }, 'query-input': 'required name=search_term_string' } },
      { '@type': 'Person', '@id': id('taphiny'), name: 'Taphiny', jobTitle: 'Mentora Sistêmica', description: 'Terapeuta e mentora sistêmica. Conduz processos de Visão Sistêmica e constelação familiar para reconhecer padrões familiares transgeracionais, restaurar a ordem dos vínculos e permitir que a vida volte a fluir.', knowsAbout: ['Visão Sistêmica', 'Terapia Sistêmica', 'Constelação Familiar', 'Padrões familiares transgeracionais', 'Empresas familiares'], url: URL_SITE, worksFor: { '@id': id('business') }, sameAs },
      { '@type': 'ProfessionalService', '@id': id('business'), name: 'Taphiny · Visão Sistêmica', description: 'Terapia sistêmica e Visão Sistêmica, abordagem que dialoga com a constelação familiar para reconhecer padrões familiares transgeracionais e restaurar a ordem dos vínculos. Atendimento a pessoas, empresas familiares e eventos.', url: URL_SITE, image: `${URL_SITE}assets/og-image.png`, logo: `${URL_SITE}assets/favicon-512.png`, founder: { '@id': id('taphiny') }, priceRange: '$$', areaServed: 'BR', availableLanguage: 'Portuguese', knowsLanguage: 'pt-BR', keywords: 'visão sistêmica, terapia sistêmica, constelação familiar, terapia sistêmica para empresas familiares, padrões familiares transgeracionais', sameAs, makesOffer: servicos.map(oferta) },
      ...servicos,
      ...faqPage,
      { '@type': 'BreadcrumbList', '@id': id('breadcrumb'), itemListElement: trilha.map((t, i) => ({ '@type': 'ListItem', position: i + 1, ...t })) },
    ],
  };
}

/** JSON pronto para ir dentro de <script>: `<` escapado para não fechar a tag. */
export const jsonLdHtml = (site: any) => JSON.stringify(montarJsonLd(site)).replace(/</g, '\\u003c');
