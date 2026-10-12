# Segurança e privacidade

Este repositório contém código, dados públicos de jogos, documentação e imagens da aplicação. Credenciais, sessões, materiais de publicações sociais, registros de contas, arquivos de ambiente e backups não fazem parte da versão pública.

## Aplicação

- O catálogo funciona em HTML/CSS/JavaScript, sem chaves de API.
- Preferências e favoritos ficam no navegador.
- Builds compatíveis usam iframe com `allow-scripts` e `allow-pointer-lock`, sem `allow-same-origin`, pop-ups ou navegação superior.
- URLs e bases do player passam por validação de origem e caminho.
- O armazenamento do player é temporário; não há garantia de progresso persistente.
- Links externos dependem dos responsáveis pelas respectivas páginas.

Os dois perfis profissionais públicos presentes na função de download são destinos de navegação do produto. O repositório não contém credenciais dessas redes, histórico de mensagens nem materiais dos posts publicados.

## Contribuições

Não envie tokens, cookies, arquivos `.env`, dados pessoais, screenshots de contas ou backups em commits e issues. Use placeholders em exemplos. Se encontrar uma credencial em qualquer versão, avise o mantenedor sem reproduzir seu valor publicamente; ela deve ser revogada antes de outras medidas.
