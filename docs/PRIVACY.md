# Escopo público

A versão pública contém uma seleção explícita de fontes, dados públicos de jogos, testes e imagens da aplicação. Materiais de publicações sociais, arquivos de contas, backups, relatórios pessoais e histórico de desenvolvimento anterior não foram incluídos.

## Verificação de 12/10/2026

- Gitleaks 8.30.1, obtido da distribuição oficial com checksum conferido: nenhuma ocorrência detectada no checkout selecionado.
- Revisão manual das fontes, metadados e mídia da aplicação.
- Build e regressões do player e catálogo executados no checkout público.
- HTML preservado, com o mesmo SHA-256 da versão publicada.

Execute `npm run check:public` antes de enviar mudanças. Esse guard rejeita caminhos de materiais privados, links de posts sociais, caminhos pessoais e formatos comuns de credenciais. Para uma auditoria completa de segredos, utilize também Gitleaks; detecção por padrões não é garantia absoluta.

As duas URLs de perfis profissionais públicos usadas na função de download fazem parte do produto; não são links de publicações nem credenciais.
