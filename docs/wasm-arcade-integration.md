# Coleção WASM Arcade — atualização local de 13/10/2026

Pedido: todos os títulos do catálogo público, com links de execução que dispensem a página do WASM Arcade. O usuário aprovou cadastrar os jogos bloqueados com disponibilidade clara. Push e publicação ficam para uma etapa posterior.

## Resultado

- 1.082 registros de origem: 5 PC, 227 arcade e 850 Flash.
- 55 alternativas no player existente: 54 correspondências únicas de nome com versões Web e GTA III com a build PC já cadastrada (`gn-851`). As fichas deixam explícito que a versão pode diferir.
- GTA V usa `https://gta.deloskiyt.pl/`, extraído dos metadados públicos e indicado pelo usuário. É um jogador com canvas/carregador; exige WebGPU no desktop e pode conter anúncios. Sem partida validada.
- 1.026 registros aguardam integração. O botão é **Ver disponibilidade** e abre uma mensagem local. Nenhum desses registros tenta carregar arquivos bloqueados ou redireciona para o WASM Arcade.
- Total do Edy Games: 1.894 entradas. O filtro de coleção e a opção **Somente com acesso direto** distinguem os estados; sorteio exclui indisponíveis. Os dados originais e IDs de favoritos foram preservados.
- Títulos sem arte existente usam cartões SVG de identificação, explicitamente descritos na ficha.

## Evidência da fonte

Metadados: `data/wasm-arcade.json`, com os três bundles públicos observados. O importador lê somente literais; não avalia, executa nem importa JavaScript remoto. Alterações de formato ou contagem interrompem a importação para revisão.

As respostas de `https://wasmarcade.com/vice-city`, `/minecraft`, `/games/vice-city/game.js`, `/games/gta3/game.js`, `/games/shar/launcher.js`, `/flash/swf/canabalt.swf` e `/emulation/roms/mslug.zip` foram amostradas em 13/10/2026. As páginas usam `X-Frame-Options: SAMEORIGIN` e `frame-ancestors 'self'`. Scripts e dados usam `Cross-Origin-Resource-Policy: same-origin`, sem `Access-Control-Allow-Origin`. Apenas conhecer a URL do arquivo não permite executá-lo em outra origem. Nenhum proxy nem remoção dessas proteções foi implementado.

## Verificações

- 56 destinos configurados responderam HTTP 200 em HEAD. As 55 builds permitem CORS, inclusive para o contexto opaco do player. Relatório: `wasm-link-checks.json`. Isso comprova acessibilidade do destino, sem garantir todos os assets ou uma partida completa.
- Testes existentes do player e catálogo, mais `tests/wasm-arcade.test.mjs`: importação segura, correspondência conservadora, todos os 1.082 IDs presentes, nenhum destino de execução no domínio WASM Arcade, preservação de 776 entradas GN, sandbox e sintaxe do HTML gerado.
- Navegador IAB: filtro da coleção mostrou 56 destinos; busca de GTA V confirmou os três links do cartão em `gta.deloskiyt.pl`; busca Metal Slug mostrou mensagem local sem `srcdoc` nem redirecionamento.
- Bloxorz alternativo carregou o Ruffle e mostrou o menu de início dentro do player Edy Games, sem erros/warnings observados. Não foi concluída uma partida. Evidência: `screenshots/wasm-bloxorz-player.jpg`.
- Layout da seleção GTA V: 320×568, 390×844, 768×1024, 1024×600, 1366×768, 1920×1080 e limites 679/681 e 1049/1051; sem rolagem horizontal do documento ou imagens quebradas.
- Player indisponível: 320×568, 768×1024, 1366×768, 1920×1080; mensagem e retorno acessíveis, frame oculto, sem rolagem horizontal.
- Lista extensa, seleção vazia, reset e ficha verificados em navegador. Dimensões CSS simuladas; dispositivos físicos, escala real do Windows, teclado virtual e texto ampliado a 200% permanecem pendentes.

## Atualizar os metadados

```sh
node scripts/import-wasm-arcade.mjs
node scripts/build.mjs
node tests/player.test.mjs
node tests/catalog.test.mjs
node tests/wasm-arcade.test.mjs
```

O importador mantém correspondências conservadoras. Novas origens de execução exigem análise de compatibilidade e confirmação de acesso; não transforme URLs de ROM/SWF em páginas de jogo.
