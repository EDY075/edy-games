# Estrutura do projeto

## Entradas do build

- `src/catalog.html`: página completa, CSS e chuva inline.
- `src/player/core.mjs`: limites de origem e preparação das builds do player.
- `src/player/ui.js`: controles do player.
- `data/catalog.json`: dados, fontes e capas do catálogo.
- `assets/fonts/embedded.css`: fontes embutidas.

`src/player/ui.html`, `src/player/ui.css` e `src/effects/data-rain.js` são referências auxiliares do desenvolvimento. HTML/CSS do player e a chuva em execução estão inline em `src/catalog.html`; editar apenas os auxiliares não modifica a aplicação.

## Operação

`scripts/build.mjs` escreve o HTML em `publish/index.html` e `outputs/edy-games-catalogo.html`. `scripts/preview.mjs` serve somente o catálogo na porta 55075. `tests/` contém regressões e fixtures específicas do player. `docs/` reúne instruções e mídia da interface.
