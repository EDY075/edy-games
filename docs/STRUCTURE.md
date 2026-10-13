# Estrutura do projeto

## Entradas do build

- `src/catalog.html`: página completa, CSS e chuva inline.
- `src/player/core.mjs`: limites de origem e preparação das builds do player.
- `src/player/ui.js`: controles do player.
- `data/catalog.json`: dados, fontes e capas do catálogo.
- `assets/fonts/embedded.css`: fontes embutidas.
- `assets/covers/gta-v.webp`: arte do destaque principal.
- `src/catalog-export.mjs`: reúne as capas locais para o download portátil.

`src/player/ui.html`, `src/player/ui.css` e `src/effects/data-rain.js` são referências auxiliares do desenvolvimento. HTML/CSS do player e a chuva em execução estão inline em `src/catalog.html`; editar apenas os auxiliares não modifica a aplicação.

## Operação

`scripts/build.mjs` gera `publish/index.html` com as novas capas em `publish/covers/`, e `outputs/edy-games-catalogo.html` com as imagens embutidas. `scripts/preview.mjs` serve somente esses arquivos na porta 55075. A versão publicada carrega imagens da página atual sob demanda. O download reúne as imagens locais em um único HTML; falhas de rede interrompem o download com uma mensagem para tentar novamente. `tests/` contém regressões e fixtures específicas do player. `docs/` reúne instruções e mídia da interface.
