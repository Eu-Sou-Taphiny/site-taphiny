import { defineConfig } from 'astro/config';

// Site estático — a Vercel detecta Astro sozinha (output "static", pasta dist/).
export default defineConfig({
  site: 'https://www.eusoutaphiny.com.br',
});
