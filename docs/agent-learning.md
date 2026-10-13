# Aprendizados verificados

- Em 13/10/2026, WASM Arcade impedia incorporação externa por SAMEORIGIN/CSP e acesso aos assets amostrados por CORP sem CORS. URL direta de SWF/ROM não equivale a execução em outra origem. Reavaliar apenas após mudança dos headers ou descoberta de um host independente compatível.
- Os bundles públicos contêm literais de catálogo; é possível ler metadados sem executar código remoto. `scripts/import-wasm-arcade.mjs` falha se o formato/contagens mudarem. Verificação: `tests/wasm-arcade.test.mjs`.
- A build compatível Bloxorz abriu o menu Ruffle em sandbox sem `allow-same-origin`. Isso valida essa amostra, sem generalizar a todos os jogos. Evidência em `docs/wasm-arcade-integration.md`.
- REA 6.4.0 registrou Codex e expôs 170 ferramentas em handshake MCP local. `binary_session` também confirmou servidor ativo e alinhado nesta sessão. Isso não comprova engine nativo disponível.

- Atualização das capas: 1.027 WebP recebidos, 1.082 registros da coleção com arte real. Na publicação, separar essas imagens para respeitar 25 MiB por asset; o exportador portátil deve incorporar novamente as capas locais. Verificação: tests/covers.test.mjs e comparação das 1.894 imagens do exportador com a fonte.
- O usuário autorizou páginas específicas como fallback após a primeira entrega. Minecraft tem jogador HTML independente que pode abrir como navegação principal mesmo com bloqueio de iframe; bloqueio de incorporação não implica bloqueio de link externo.
