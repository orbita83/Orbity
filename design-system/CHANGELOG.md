# Changelog

Versões no formato `MAIOR.MENOR.CORREÇÃO`. Mudança grande = versão nova (ex.: 2.4.1 → 3.0.0).

## 1.0.0 · 21/10/2026

- Primeira versão do sistema, apresentada na aula de 21/10.
- **Responsáveis:** Equipe Orbity (IHC + PDM)
- **Mudanças:** Formalização completa da camada visual e de interação do Orbity: Princípios de produto não punitivos (01), Tokens semânticos e primitivos para modos claro e escuro (02), Fundamentos de cor, tipografia e acessibilidade (03), Componentes fundamentais (04 - Botão, Card de Tarefa, Chips de Filtro, NavBar, Painel Deslizante, Visualização de Sequência), Padrões e fluxos F0 a F10 (05), Acessibilidade e limiares matemáticos WCAG AA (06) e Protocolo experimental de teste com IA (07).
- **Ajustes feitos após o teste com IA:**
  - Proibição explícita de tamanhos tipográficos intermediários em `03-fundamentos.md` e `05-padroes.md`, eliminando invenções arbitrárias de `fontSize: 18` e `fontSize: 20` e orientando o uso de `font.body` com peso enfático (700 ou 600) ou `font.title`.
  - Padronização dimensional de esqueletos (*skeletons*) em `03-fundamentos.md`, exigindo larguras percentuais e alturas correspondentes ao `lineHeight` dos tokens tipográficos (32 px, 24 px, 20 px) com `radius.md`.
  - Formalização dimensional do selo/avatar de estudante no fluxo F10 de `05-padroes.md`, ancorando-o ao `target.min-size` (48 × 48 dp com raio de 24 dp).
  - Padronização do feedback tátil (`pressed`) para cards e listas em `03-fundamentos.md` com `color.surface-variant` ou opacidade 0.8.
