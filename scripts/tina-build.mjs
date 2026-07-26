// Builda o painel do TinaCMS (/admin) SOMENTE quando as credenciais do
// Tina Cloud estão presentes. Sem elas, pula essa etapa — o site em si
// (Astro) é gerado normalmente, pois lê o conteúdo direto do JSON.
import { execSync } from "node:child_process";

const hasCreds = process.env.TINA_CLIENT_ID && process.env.TINA_TOKEN;

if (hasCreds) {
  console.log("TinaCMS: credenciais encontradas — gerando o painel /admin...");
  execSync("npx tinacms build", { stdio: "inherit" });
} else {
  console.log(
    "TinaCMS: sem TINA_CLIENT_ID/TINA_TOKEN — pulando o painel /admin (o site é gerado normalmente)."
  );
}
