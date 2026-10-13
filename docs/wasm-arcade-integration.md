# Coleção WASM Arcade — atualização local de 13/10/2026

Pedido vigente: cadastrar todos os jogos, priorizar execução direta, usar a página específica da origem quando não houver versão direta, incluir capas reais e destacar GTA V na hero. Push e publicação ficam para depois.

## Resultado

- 1.082 registros: 5 PC, 227 arcade e 850 Flash. Total Edy Games: 1.894.
- 55 alternativas compatíveis no player Edy Games, com aviso de que a edição pode diferir.
- GTA V abre https://gta.deloskiyt.pl/; Minecraft abre https://wasmarcade.com/eaglercraft/1.8.8/app.html, somente o jogador. Ambos com HTTP 200; partida completa não validada.
- 1.025 títulos abrem a página específica do jogo na origem, com âncora do jogador: PC/Flash usam #game-surface, arcade usa #game. Esse redirecionamento foi autorizado pelo usuário após a primeira versão. O filtro **Somente com acesso direto** mostra 57 destinos e exclui essas páginas.
- Nenhum proxy ou remoção de proteções de incorporação. Tela cheia do navegador na outra origem exige gesto do usuário; a âncora posiciona no jogador, sem prometer tela cheia automática. Não foi identificado parâmetro de URL que inicie fullscreen.
- Todas as 1.082 entradas da coleção têm capa/arte real. Foram recebidas 1.027 imagens WebP e preservadas 55 imagens existentes. Fontes e assinatura dos arquivos conferidas; relatório wasm-cover-checks.json. Arcade/PC usam artes de capa e Flash usa as imagens do próprio jogo. Nenhum cartão textual permanece.
- Hero GTA V com a arte de Trevor e botão direto ao jogador.

## Publicação e HTML portátil

O build gera publish/index.html com aproximadamente 20,94 MB e 1.027 imagens em publish/covers/. O limite individual de static asset da Cloudflare é 25 MiB: https://developers.cloudflare.com/workers/platform/limits/. Publique a pasta completa publish/. As novas imagens são carregadas sob demanda.

outputs/edy-games-catalogo.html continua sendo um HTML único, com aproximadamente 61,85 MB e todas as capas embutidas. O botão de baixar da versão publicada reúne as imagens da própria origem antes de gerar o HTML. Os limites de origem, timeout e tamanho são verificados; erro de rede evita salvar uma cópia sem capas. Exportação em teste de integração local reuniu as 1.894 capas, idênticas à fonte. O servidor retorna 404 para arquivos fora do diretório publicado.

O importador lê literais de metadados sem executar JavaScript remoto e preserva as capas recebidas nas reimportações. Falha ao mudar formato/contagem da fonte. Para novas entradas sem capa, node scripts/update-wasm-covers.mjs recebe as imagens.

## Validação

- Build e testes player, catalog, wasm-arcade e covers: passaram. Incluem IDs, rotas diretas/alternativas por jogo, preservação GN, exportação portátil, assets WebP e tamanho de publicação.
- Primeira conferência dos 56 destinos diretos: todos HTTP 200; builds compatíveis com CORS. Relatório wasm-link-checks.json. Minecraft adicional: HTTP 200, HTML EaglercraftX 1.8 WASM-GC. HTTP 200 não comprova todos os assets nem uma partida.
- Navegador IAB: hero GTA V carregada (896×1200) com link correto; seis capas Metal Slug carregadas e links específicos conferidos. Busca, coleção, filtro de acesso direto, ficha e estado vazio verificados. Página Metal Slug na origem aberta no navegador: controles Play e Fullscreen presentes. Sem erros/warnings observados na página.
- Nova matriz: 320×568, 390×844, 768×1024, 1024×600, 1366×768, 1920×1080; seis capas carregadas e nenhum overflow horizontal do documento. Desktop e celular da hero também inspecionados. Viewports CSS simulados, sem aparelho físico.
- Primeira amostra Bloxorz: Ruffle mostrou menu dentro do player Edy Games, sem partida completa. A evidência antiga wasm-bloxorz-player.jpg permanece como registro dessa amostra.
- Dispositivos físicos, escala do Windows, teclado virtual, texto a 200% e partidas de cada título permanecem sem validação.

Evidências atuais: screenshots/gta-v-hero.jpg e screenshots/wasm-real-covers.jpg.
