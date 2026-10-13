# REA — instalação local

Fonte oficial: https://github.com/morluto/rea. Pacote npm: `rea-agents`, versão instalada 6.4.0. REA oferece CLI, servidor MCP e instruções de investigação para agentes. Foi instalado como ferramenta local, separado das dependências do Edy Games.

O setup oficial foi inspecionado com `setup --client codex --dry-run` e depois aplicado somente ao Codex. Ele preservou as demais configurações, criou backup do arquivo de configuração e instalou a skill `reverse-engineer-anything`, versão 37. Nenhuma credencial foi adicionada ou alterada, e nenhuma aplicação pessoal foi analisada.

Verificação: `doctor --client codex` retornou integração saudável, registro e skill alinhados. Uma conexão stdio real passou por `initialize`, `notifications/initialized` e `tools/list`: 170 ferramentas, incluindo análise estática JavaScript e bundles web. O servidor de teste foi encerrado.

Reabra o Codex para carregar o servidor MCP na sessão. A skill será descoberta nas próximas sessões/turnos. A análise de código JavaScript não exige engine nativo. Análise profunda de binários requer configurar Ghidra, Hopper ou IDA; nenhum deles foi instalado nesta tarefa. Ferramentas comerciais mantêm seus requisitos próprios.

As ferramentas do REA não contornam permissões de incorporação ou CORS. A instalação não altera os bloqueios do WASM Arcade.
