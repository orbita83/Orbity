## Versão proposta

<!-- O destino deste PR deve ser main e a origem deve ser development. Use o título obrigatório: release: publicar versão X.Y.Z (ex.: release: publicar versão 0.1.0). -->

- Versão anterior: <!-- X.Y.Z ou primeira publicação -->
- Versão proposta: <!-- X.Y.Z (a primeira versão estável oficial do aplicativo é 0.1.0) -->
- Justificativa do incremento: <!-- MAJOR (incompatibilidade), MINOR (novas funcionalidades) ou PATCH (correções), conforme CONTRIBUTING.md Seção 4.6. -->

## Resumo da publicação

<!-- Descreva as principais entregas agrupadas por categoria, referenciando os PRs integrados na development. -->

- **Novidades (Features):**
- **Correções (Bug Fixes):**
- **Melhorias e Manutenção (Chores/Refactors):**
- **Documentação (Docs):**

## Escopo revisado

<!-- Confirme o cumprimento das diretrizes de governança de release (CONTRIBUTING.md Seções 4.1 a 4.4). -->

- [ ] As alterações incluídas correspondem exatamente ao escopo planejado para esta versão
- [ ] O princípio de desacoplamento foi respeitado (conclusão de issue/épico não impõe publicação automática)
- [ ] Não há alterações inesperadas ou não revisadas na branch `development`
- [ ] A política de congelamento (*release freeze*) foi observada durante o ciclo de validação deste PR
- [ ] Alterações tardias adicionadas após a abertura do PR foram reavaliadas e revalidadas integralmente

## Validação e Qualidade

<!-- Descreva comandos executados, evidências de testes manuais e checagens automáticas (CONTRIBUTING.md Seção 4.5). -->

- [ ] Alterações validadas previamente pelo CI na `development` e verificações locais (`lint`, `tsc --noEmit` e testes Jest) aprovadas com 100% de sucesso
- [ ] Testes manuais/exploratórios executados e validados em ambiente Android (dispositivo físico ou emulador)
- [ ] Ausência de defeitos críticos ou bloqueadores conhecidos (severidade P0)
- [ ] Versão proposta (`versionName`) e identificadores de build (`versionCode`) conferidos e consistentes nos manifestos

## Procedimentos Pós-Merge

<!-- Diretrizes a serem executadas imediatamente após o merge na main (CONTRIBUTING.md Seções 4.7 e 4.8). -->

- [ ] Criação e envio da Git tag anotada no commit de merge na `main`: `git tag -a vX.Y.Z -m "release: publicar versão X.Y.Z"` e `git push origin vX.Y.Z`
- [ ] Publicação da GitHub Release correspondente com changelog e notas de lançamento
- [ ] Caso seja um hotfix emergencial, abertura imediata de PR de sincronização de retorno para a `development`

## Informações adicionais (opcional)

<!-- Registre riscos conhecidos não bloqueadores, limitações e observações relevantes para os aprovadores. -->
