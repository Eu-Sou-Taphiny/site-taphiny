// Dados estruturados (schema.org / JSON-LD) da home.
//
// Montados a partir do conteúdo, e não escritos à mão no HTML, para acompanhar o
// painel: seção desligada sai do breadcrumb (e o FAQ sai inteiro), e os serviços
// de negócios só entram enquanto a seção Empresas estiver no ar.

export const URL_SITE = 'https://eusoutaphiny.com.br/';
const id = (frag: string) => `${URL_SITE}#${frag}`;

/** Seção ligada? Campo ausente (conteúdo antigo) conta como ligada. */
export const visivel = (secao: any) => secao?.exibir !== false;

export function montarJsonLd(site: any) {
  const { visao, jornadas, faq, empresas } = site;

  const servicosNegocios = visivel(empresas) ? [
    { '@type': 'Service', '@id': id('servico-negocios'), name: 'Terapias para Negócios', serviceType: 'Terapia Sistêmica para empresas familiares', description: 'Visão Sistêmica aplicada a empresas familiares, relação entre sócios, liderança e equipes, trabalhando pertencimento, cultura e prosperidade.', provider: { '@id': id('business') }, areaServed: 'BR' },
    { '@type': 'Service', '@id': id('servico-workshops'), name: 'Workshops & Palestras', serviceType: 'Terapia Sistêmica', description: 'Workshops e palestras sobre Visão Sistêmica, pertencimento, cultura e prosperidade para empresas e eventos.', provider: { '@id': id('business') }, areaServed: 'BR' },
  ] : [];

  const servicos = [
    { '@type': 'Service', '@id': id('servico-sessao'), name: 'Sessão Sistêmica (Olhar)', serviceType: 'Terapia Sistêmica', description: 'Encontro individual direcionado a um tema específico — uma decisão, um relacionamento, carreira, dinheiro ou um padrão que se repete. Ideal para quem busca clareza sobre um momento.', provider: { '@id': id('business') }, areaServed: 'BR', offers: { '@type': 'Offer', price: '450', priceCurrency: 'BRL' } },
    { '@type': 'Service', '@id': id('servico-essencia'), name: 'Jornada Essência', serviceType: 'Terapia Sistêmica', description: 'Quatro encontros para reorganizar o eixo interno, fortalecer o lugar de adulto e construir uma vida mais alinhada com quem realmente se é.', provider: { '@id': id('business') }, areaServed: 'BR' },
    { '@type': 'Service', '@id': id('servico-raizes'), name: 'Jornada Raízes', serviceType: 'Constelação Familiar', description: 'Sete encontros de investigação profunda das dinâmicas familiares e dos padrões transgeracionais, no espírito da constelação familiar, para recuperar a força necessária para construir o futuro.', provider: { '@id': id('business') }, areaServed: 'BR' },
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

  const faqPage = visivel(faq) ? [{ '@type': 'FAQPage', '@id': id('faq'), mainEntity: [
    { '@type': 'Question', name: 'O que é Visão Sistêmica?', acceptedAnswer: { '@type': 'Answer', text: 'A Visão Sistêmica é uma abordagem terapêutica que enxerga a pessoa dentro dos sistemas a que pertence — família, vínculos e história. Ela parte do princípio de que nem tudo o que vivemos começou em nós: muitos padrões, lealdades e bloqueios são herdados ao longo das gerações. O trabalho reconhece essas dinâmicas para restaurar a ordem dos vínculos e permitir que a vida volte a fluir.' } },
    { '@type': 'Question', name: 'Visão Sistêmica é a mesma coisa que constelação familiar?', acceptedAnswer: { '@type': 'Answer', text: 'São práticas irmãs, da mesma raiz. A constelação familiar é uma das ferramentas mais conhecidas da abordagem sistêmica, geralmente feita em grupo, enquanto a Visão Sistêmica é o olhar mais amplo que fundamenta esse trabalho e pode ser conduzido também de forma individual. Quem busca constelação familiar encontra aqui esse mesmo princípio, aplicado de maneira profunda e personalizada.' } },
    { '@type': 'Question', name: 'Qual a diferença entre psicoterapia e Visão Sistêmica?', acceptedAnswer: { '@type': 'Answer', text: 'Não são caminhos opostos, e sim complementares. A psicoterapia amplia a consciência sobre a experiência individual — pensamentos, emoções e comportamentos. A Visão Sistêmica observa a pessoa dentro dos sistemas a que pertence, revelando lealdades invisíveis e dinâmicas familiares para restaurar a ordem dos vínculos.' } },
    { '@type': 'Question', name: 'Como funciona uma sessão?', acceptedAnswer: { '@type': 'Answer', text: 'Cada encontro é individual e direcionado a um tema específico: uma decisão, um relacionamento, a carreira, o dinheiro ou um padrão que se repete. Em um espaço seguro, aquilo que permaneceu invisível é reconhecido, respeitado e reorganizado. A Sessão Sistêmica (Olhar) parte de R$ 450 por encontro, e há também jornadas mais profundas, como a Essência e a Raízes.' } },
    { '@type': 'Question', name: 'Para quem é indicado?', acceptedAnswer: { '@type': 'Answer', text: 'É indicado para quem percebe padrões que se repetem, sente que compreender já não basta e deseja ocupar o próprio lugar com mais leveza. Também se aplica a empresas familiares, relação entre sócios e liderança. Não é indicado para quem busca soluções imediatas ou espera que o caminho seja feito por outra pessoa.' } },
  ] }] : [];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': id('website'), url: URL_SITE, name: 'Taphiny — Visão Sistêmica', description: 'Visão Sistêmica, terapia sistêmica e constelação familiar com Taphiny.', inLanguage: 'pt-BR', publisher: { '@id': id('business') }, potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${URL_SITE}?s={search_term_string}` }, 'query-input': 'required name=search_term_string' } },
      { '@type': 'Person', '@id': id('taphiny'), name: 'Taphiny', jobTitle: 'Mentora Sistêmica', description: 'Terapeuta e mentora sistêmica. Conduz processos de Visão Sistêmica e constelação familiar para reconhecer padrões familiares transgeracionais, restaurar a ordem dos vínculos e permitir que a vida volte a fluir.', knowsAbout: ['Visão Sistêmica', 'Terapia Sistêmica', 'Constelação Familiar', 'Padrões familiares transgeracionais', 'Empresas familiares'], url: URL_SITE, worksFor: { '@id': id('business') }, sameAs: ['https://instagram.com/eu.sou.taphiny'] },
      { '@type': 'ProfessionalService', '@id': id('business'), name: 'Taphiny — Visão Sistêmica', description: 'Terapia sistêmica e Visão Sistêmica, abordagem que dialoga com a constelação familiar para reconhecer padrões familiares transgeracionais e restaurar a ordem dos vínculos. Atendimento a pessoas, empresas familiares e eventos.', url: URL_SITE, image: `${URL_SITE}assets/og-image.png`, logo: `${URL_SITE}assets/favicon-512.png`, founder: { '@id': id('taphiny') }, priceRange: '$$', areaServed: 'BR', availableLanguage: 'Portuguese', knowsLanguage: 'pt-BR', keywords: 'visão sistêmica, terapia sistêmica, constelação familiar, terapia sistêmica para empresas familiares, padrões familiares transgeracionais', sameAs: ['https://instagram.com/eu.sou.taphiny'], makesOffer: servicos.map(oferta) },
      ...servicos,
      ...faqPage,
      { '@type': 'BreadcrumbList', '@id': id('breadcrumb'), itemListElement: trilha.map((t, i) => ({ '@type': 'ListItem', position: i + 1, ...t })) },
    ],
  };
}

/** JSON pronto para ir dentro de <script>: `<` escapado para não fechar a tag. */
export const jsonLdHtml = (site: any) => JSON.stringify(montarJsonLd(site)).replace(/</g, '\\u003c');
