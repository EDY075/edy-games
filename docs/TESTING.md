# Testes e limites

Depois do build, execute `npm test`.

- `tests/player.test.mjs`: URLs permitidas, rejeição de destinos inválidos, portabilidade dos links, compatibilidade temporária e regressões específicas de DOOM e Resident Evil.
- `tests/catalog.test.mjs`: dataset embutido, capas, total coerente com a fonte e URLs de origem dos 776 itens GN Math.

O build confere capas, URLs GN e marcadores não resolvidos. Os comandos usam apenas módulos nativos do Node.

A versão de 12/10/2026 reúne 812 entradas principais e 14 fichas secundárias. A conferência de URLs foi realizada em lote. Acessibilidade HTTP não comprova gameplay completo nem ausência universal de anúncios. Projetos da seção de arquivos têm requisitos próprios; não existe emulação nativa de PS3 ou Xbox 360 sem arquivos confirmada no catálogo.

A preparação pública executa build e regressões em um checkout separado. Os HTMLs permanecem idênticos à versão publicada.
