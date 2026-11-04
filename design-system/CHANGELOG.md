# Changelog

Versões no formato `MAIOR.MENOR.CORREÇÃO`. Mudança grande = versão nova (ex.: 2.4.1 → 3.0.0).

## 1.1.0 — em preparação

- Revisão da identidade cromática, dos componentes e da acessibilidade do ODS, com validação visual e teste com IA antes da conclusão da versão. As entregas e seus resultados serão registrados conforme forem integrados.
- **Issue #84:** Centralização documental dos papéis cromáticos cósmicos e orientação para seleção da variante em F1/F2. Os contratos dos temas base claro e escuro da versão 1.0.0 foram preservados; os novos nomes documentais não alteram seus valores.
- **Issue #85:** Alinhamento documental das variantes cósmicas do painel, planeta, botão e navbar com F1/F2, incluindo a visibilidade da navbar e lacunas dos estados. Os componentes base existentes permanecem inalterados; a migração das variantes depende da implementação futura.
- **Issue #86:** Registro de contraste dos pares cósmicos conhecidos e ajuste de `actionHover` e `progressEnd` para `#8648FA` após revisão de contraste. A validação de gradientes, sobreposições, estados sem valor e renderização real permanece pendente; consumidores da proposta cósmica anterior devem atualizar esses dois papéis ao implementá-la.
- **Identidade global:** `themes.cosmic` disponibiliza papéis escuros reutilizáveis para todas as telas e componentes. Os temas `light` e `dark` anteriores são preservados; a migração é explícita. Os componentes existentes aceitam o novo tema, sem implicar a implementação da Tela Inicial ou da Tela de Tarefas.
- **Pendências:** Implementação TypeScript na #73, alinhamento de componentes na #85 e matriz completa de contraste na #86. Esta entrada não representa uma versão publicada.

## 1.0.0 · 2026-10-21

- **Responsáveis:** Mailson Sousa, Cássio Sampaio, Mateus de Araújo, Vitor Lopes e Alisson Ramires.
- **Mudanças:** Primeira versão oficial do Orbity Design System (ODS), estabelecendo os princípios de produto não punitivos (01), tokens primitivos e semânticos para modos claro e escuro (02), fundamentos de estilo e uso (03), componentes reutilizáveis documentados e integrados (04), padrões e fluxos de navegação e interação F0 a F10 (05) e diretrizes de acessibilidade com limiares matemáticos WCAG AA (06).
- **Ajustes após o teste com IA:** Proibição de tamanhos tipográficos intermediários em favor de `font.body` com peso enfático ou `font.title`, padronização dimensional de esqueletos (*skeletons*) vinculados aos `lineHeight` dos tokens, ancoragem dimensional do avatar ao alvo mínimo de 48 × 48 dp e padronização do feedback tátil de toque com opacidade 0.8 (com evidências detalhadas em `07-teste-com-ia.md`).
- **Alinhamento do protótipo cósmico (Issue #36):** Especificação da Tela Inicial incorporada à Seção 2 de `05-padroes.md`, no formato de objetivo, componentes, passos, estados e orientações. O padrão concentra as decisões visuais e o contrato `cosmicTokens` da referência, o comportamento do visualizador vetorial, swipe, rolagem e coexistência do painel com a navbar. As referências e o inventário distinguem o protótipo de referência da implementação disponível nesta branch documental, preservando a estrutura do ODS sem um documento avulso de tela na raiz.
