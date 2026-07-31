import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://eusoutaphiny.com.br';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).filter((p) => p.data.publicado);

  const urls: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: `${SITE}/`, priority: '1.0' },
    { loc: `${SITE}/blog`, priority: '0.7' },
    ...posts.map((p) => ({
      loc: `${SITE}/blog/${p.id}`,
      lastmod: p.data.data ? p.data.data.toISOString().slice(0, 10) : undefined,
      priority: '0.6',
    })),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc>` +
          (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
          `<changefreq>monthly</changefreq><priority>${u.priority}</priority></url>`
      )
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
