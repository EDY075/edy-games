# Aprendizados verificados

- Em 13/10/2026, WASM Arcade impedia incorporação externa por SAMEORIGIN/CSP e acesso aos assets amostrados por CORP sem CORS. URL direta de SWF/ROM não equivale a execução em outra origem. Reavaliar apenas após mudança dos headers ou descoberta de um host independente compatível.
- Os bundles públicos contêm literais de catálogo; é possível ler metadados sem executar código remoto. `scripts/import-wasm-arcade.mjs` falha se o formato/contagens mudarem. Verificação: `tests/wasm-arcade.test.mjs`.
- A build compatível Bloxorz abriu o menu Ruffle em sandbox sem `allow-same-origin`. Isso valida essa amostra, sem generalizar a todos os jogos. Evidência em `docs/wasm-arcade-integration.md`.
- REA 6.4.0 registrou Codex e expôs 170 ferramentas em handshake MCP local. Registro alinhado não comprova engine nativo disponível nem carregamento do servidor na sessão atual; reabrir o Codex é necessário.
