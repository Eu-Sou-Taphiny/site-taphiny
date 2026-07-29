import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Coleção do Blog — arquivos markdown em src/content/blog/ (gerenciados pelo TinaCMS).
// O nome do arquivo é o "slug" usado em /blog/[slug].
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string(),
    data: z.coerce.date().optional(),
    capa: z.string().optional(),
    resumo: z.string().optional(),
    publicado: z.boolean().default(false),
  }),
});

export const collections = { blog };
