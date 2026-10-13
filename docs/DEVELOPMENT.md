# Desenvolvimento

Requisito para build/testes: Node.js 20+. Publicação: Node.js 22+ e Wrangler 4.150.0, fixado no package-lock.json. Os comandos da aplicação usam módulos nativos.

```sh
npm run build
npm test
npm run dev
```

Também é possível usar diretamente `node scripts/build.mjs`, `node tests/player.test.mjs`, `node tests/catalog.test.mjs` e `node scripts/preview.mjs`.

Abra **http://127.0.0.1:55075/**. Ctrl+C encerra a prévia. A porta deve estar disponível. O servidor não expõe as outras pastas.

Edite as entradas descritas em [Estrutura](STRUCTURE.md); o build recompõe os HTMLs gerados. A cópia para guardar é `outputs/edy-games-catalogo.html`; a pasta completa `publish/` contém o HTML e as capas para publicação no Cloudflare Workers Static Assets. Publique toda essa pasta, incluindo `covers/`. O wrangler.jsonc identifica a conta e o Worker. As credenciais do Cloudflare são externas ao repositório.

Busca e filtros funcionam no HTML local. Jogos, fontes e links externos exigem internet. Preferências e favoritos ficam no navegador. O player usa armazenamento temporário e não promete persistência do progresso dos jogos.

## Publicar atualização

Execute npm ci --ignore-scripts para instalar a ferramenta fixada, npm run build, npm test e npm run check:public. Depois use npm run deploy. O wrangler.jsonc identifica o Worker edy-games e a pasta publish/, preservando variáveis remotas. Autenticação Cloudflare é externa e não entra no Git. .cache/ e .wrangler/ permanecem ignorados.
