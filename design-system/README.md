# Orbity Design System (ODS)

![Identidade visual do Orbity: planeta roxo com anéis ao lado do nome Orbity](images/assets/orbity-design-system.png)

> **Versão:** 1.0.0 (rascunho) · **Integrantes:** Mailson Sousa, Cássio Sampaio, Mateus de Araujo, Vitor Lopes, Alisson Ramires · **Disciplinas:** IHC e PDM

## 1. Visão geral

O **Orbity** é um aplicativo de organização pessoal voltado aos estudantes, que reúne tarefas, rotinas, agenda e anotações em um único ambiente. Por meio de elementos de gamificação, como sequências, conquistas e estrelas, busca incentivar a constância nos estudos e valorizar o progresso individual.

O **Orbity Design System (ODS)** estabelece princípios, fundamentos, tokens e componentes para orientar a construção de interfaces consistentes, acessíveis e intuitivas, proporcionando uma experiência de organização acolhedora e motivadora.

- **Público-alvo:** estudantes que desejam organizar atividades e desenvolver hábitos de estudo sem perder o controle sobre a própria rotina.
- **Plataforma principal:** Android, com distribuição prevista pela Google Play Store. Uma versão para iOS ainda não foi decidida e não faz parte do foco atual; não há versão Web prevista.
- **Stack:** React Native 0.86, Expo 57, Expo Router e TypeScript.
- **Sistema base:** Material Design 3, adaptado à identidade, aos fluxos e às necessidades de acessibilidade do Orbity.

## 2. As 5 forças que definem o sistema base (MD3)

| Força | Justificativa |
| --- | --- |
| **Usuários** | O Material Design 3 tem como pilar melhorar a experiência do usuário com fluxos previsíveis e familiares, oferecendo uma base clara para apoiar a organização diária dos estudantes. |
| **Acessibilidade** | O sistema base já consolida práticas fortes de contraste, alvos mínimos de toque, foco e leitura de tela, que o Orbity aproveita diretamente e complementa com critérios da WCAG. |
| **Marca e componentes** | A simplicidade e a estrutura dos componentes do MD3 (botões, cards, listas e painéis) são muito próximas das necessidades do aplicativo, facilitando a adaptação à identidade visual do Orbity. |
| **Plataforma** | Fornece convenções consolidadas para Android, plataforma principal do Orbity, cuja distribuição está prevista pela Google Play Store. Uma versão para iOS ainda não foi decidida e não faz parte do foco atual; o projeto não prevê versão Web. |
| **Tecnologia** | Sua arquitetura baseada em tokens (primitivos, semânticos e de componente) e estados bem definidos mapeia de forma simples e direta para componentes em React Native, Expo e TypeScript. |

## 3. Inventário: telas × componentes

O inventário abaixo foi consolidado a partir dos fluxos descritos em [05-padroes.md](05-padroes.md) e do código versionado. Neste documento, **planejada** significa que a tela ou o fluxo está especificado, mas ainda não existe como tela de produto em `src/app/`; **parcial** indica que há ao menos um componente implementado, ainda sem integração na respectiva tela. A rota `src/app/index.tsx` contém somente a tela inicial técnica do projeto Expo e não representa uma tela concluída do Orbity.

| Tela                          | Componentes necessários                                                                                            | Situação e evidência                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Splash e onboarding           | Logo e slogan, carrossel de quatro etapas, indicadores de etapa, botão Próximo e botão Pular                       | Planejada em `05-padroes.md`; não implementada em `src/app/`.                                                                                   |
| Tela inicial                  | Cabeçalho, resumo da jornada, acesso ao modo foco, barra de navegação com cinco abas e indicadores de progresso    | Planejada em `05-padroes.md`; não implementada em `src/app/`.                                                                                   |
| Modo foco e progresso         | Painel inferior, alça de expansão, botão Iniciar, barra de progresso e atalho para Conquistas                      | Planejada em `05-padroes.md`; não implementada em `src/app/`.                                                                                   |
| Lista de tarefas              | Filtros Todos/Pendentes/Concluídas, botão Nova tarefa, cards, controles de conclusão e menu de opções              | Parcial: o botão primário está documentado e implementado como `PrimaryButton`; tela, filtros, cards e demais controles ainda estão planejados. |
| Nova tarefa e confirmação     | Modal de formulário, campos de texto, seletores, botão Criar, mensagens de validação e modal de sucesso            | Parcial: pode reutilizar `PrimaryButton`; os demais componentes e a tela ainda estão planejados.                                                |
| Seleção múltipla de tarefas   | Barra contextual, contador de seleção e ações Fixar, Marcar todas, Excluir e Cancelar                              | Planejada em `05-padroes.md`; não implementada em `src/app/`.                                                                                   |
| Lista e criação de rotinas    | Cards de rotina, botão Nova rotina, formulário, seleção de dias e lista de tarefas reordenáveis                    | Parcial: pode reutilizar `PrimaryButton`; os demais componentes e as telas ainda estão planejados.                                              |
| Detalhe da rotina             | Cards de turno, itens reordenáveis, controles de conclusão e botões Marcar como concluída e Desmarcar todos        | Planejada em `05-padroes.md`; não implementada em `src/app/`.                                                                                   |
| Lista e detalhe de conquistas | Campo de busca, cards de conquista, indicadores de progresso, modal de detalhes, botão Compartilhar e botão Fechar | Parcial: pode reutilizar `PrimaryButton`; os demais componentes e as telas ainda estão planejados.                                              |
| Cosmos e detalhe da estrela   | Mapa de constelação, estrelas com estados perceptíveis além da cor, modal de detalhes e botão Fechar               | Planejada em `05-padroes.md`; não implementada em `src/app/`.                                                                                   |
| Perfil                        | Cabeçalho do estudante, cards de métricas e atalhos para Conquistas, Categorias e Ajustes                          | Planejada em `05-padroes.md`; não implementada em `src/app/`.                                                                                   |

## 4. Mapa dos arquivos

| Arquivo                                      | Responsabilidade                                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [01-principios.md](01-principios.md)         | Define os valores que orientam decisões de produto e interface, incluindo valorização da trajetória, autonomia e hierarquia da informação. |
| [02-tokens.md](02-tokens.md)                 | Registra tokens primitivos, semânticos e de componente, além do comportamento dos temas claro e escuro.                                    |
| [03-fundamentos.md](03-fundamentos.md)       | Estabelece regras de uso para cor, tipografia, espaçamento, ícones, elevação e movimento.                                                  |
| [04-componentes/](04-componentes/)           | Reúne a especificação de cada componente, com origem, anatomia, variantes, estados, acessibilidade e vínculo com o código.                 |
| [05-padroes.md](05-padroes.md)               | Documenta fluxos de interação, composição de telas, estados e lacunas funcionais conhecidas.                                               |
| [06-acessibilidade.md](06-acessibilidade.md) | Centraliza requisitos e verificações de contraste, alvos de toque, foco, leitores de tela, texto ampliado e redução de movimento.          |
| [07-teste-com-ia.md](07-teste-com-ia.md)     | Reserva o registro das rodadas de validação do ODS com assistentes de IA e das correções decorrentes.                                      |
| [CHANGELOG.md](CHANGELOG.md)                 | Mantém o histórico de versões, responsáveis e mudanças do ODS.                                                                             |

## 5. Etiquetas de origem

Cada token, componente, princípio ou regra deve receber uma das etiquetas abaixo. A etiqueta descreve a relação com o sistema base; ela não indica o estágio de implementação.

- **Herdado:** adotado do Material Design 3 ou de uma diretriz de acessibilidade sem alteração relevante. Deve citar a diretriz ou o token de origem. Exemplos documentados: grade de espaçamento de 8 pontos, `target.min-size` e `focus.ring-width`.
- **Adaptado:** parte de uma referência existente, mas foi ajustado ao contexto do Orbity. Deve registrar a origem e o motivo da adaptação. Exemplos documentados: `color.action`, `font.title` e o botão primário baseado no Material 3 Filled button.
- **Novo:** criado para uma necessidade específica do Orbity sem equivalente direto adotado do sistema base. Deve justificar essa necessidade. Exemplos documentados: os princípios “Valorizar a trajetória, não apenas os resultados” e “O controle pertence ao estudante”, além do token primitivo `success-500`.

Não atribua uma origem por semelhança visual. Quando a evidência não estiver documentada, registre a lacuna antes de classificar o item.

## 6. Glossário

| Termo               | Significado no ODS                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ODS                 | Sigla de Orbity Design System, o conjunto versionado de princípios, tokens, fundamentos, componentes e padrões do Orbity.         |
| Token               | Decisão de design nomeada e reutilizável que associa uma função a um valor ou a outro token, como `color.action` → `blue-600`.    |
| Token primitivo     | Valor bruto da escala visual, sem contexto de uso específico, como `blue-600` ou `space-16`.                                      |
| Token semântico     | Token que expressa uma finalidade de interface e pode mudar conforme o tema, como `color.surface`.                                |
| Token de componente | Token que relaciona uma parte ou estado de um componente a um token semântico ou primitivo, como `button.bg`.                     |
| Componente          | Unidade reutilizável de interface com anatomia, variantes, estados, comportamento e requisitos de acessibilidade documentados.    |
| Padrão              | Combinação recorrente de componentes e regras para resolver um fluxo ou interação do produto.                                     |
| Sequência           | Período de constância do estudante; deve incentivar continuidade sem apagar ou desvalorizar o progresso acumulado após uma pausa. |
| Conquista           | Marco associado ao progresso do estudante, com critério de desbloqueio e estado identificável.                                    |
| Estrela             | Unidade visual de progresso desbloqueada no módulo Cosmos.                                                                        |
| Constelação         | Representação acumulativa da jornada do estudante, formada por estrelas e preservada sem regressões punitivas.                    |
| Tema                | Conjunto de valores associados aos mesmos tokens semânticos nos modos claro e escuro.                                             |

## 7. Quem mantém

O Orbity Design System (ODS) adota um modelo de governança **híbrida**, combinando decisões centralizadas de produto com autonomia dos integrantes nas decisões de implementação.

As decisões de produto, que definem a direção, os objetivos e a experiência do Orbity, são tomadas de forma centralizada pela equipe responsável.

As decisões de implementação ficam a cargo dos integrantes responsáveis por cada atividade, que possuem autonomia para definir as soluções técnicas. Todas as decisões tomadas durante a implementação devem ser comunicadas a Mailson Sousa, responsável por acompanhar e manter o alinhamento técnico do projeto.

**Responsáveis pela manutenção:**

- Mailson Sousa (`@MailsonSousa88`)
- Cássio Sampaio (`@Cassiosampaio2016`)
- Mateus de Araujo (`@MateusARJ`)
- Vitor Lopes (`@vitorlopes-coder`)
- Alisson Ramires (`@AlissonSena7`)

## 8. Uso de IA na redação

> [!NOTE]
> **IA como ferramenta, não como muleta.**

### Atuação da IA

A IA foi utilizada de forma sistemática como ferramenta de apoio à redação dos documentos e ao processo de criação do Orbity Design System. Sua atuação consistiu em estruturar, organizar e expressar tecnicamente os conteúdos produzidos ao longo das atividades, sempre com base nas decisões e nos requisitos fornecidos pelos integrantes.

### Responsabilidade da equipe

As decisões de produto, design e implementação permaneceram sob responsabilidade dos integrantes. A equipe definiu as soluções com base em discussões internas, ideias desenvolvidas pelos integrantes, requisitos do projeto e prototipação iterativa. O Material Design 3 foi utilizado como principal fonte de inspiração e referência para fundamentar as ideias que orientaram a criação do ODS.

### Validação humana

A validação humana foi realizada por meio da revisão das tarefas e de seus respectivos resultados. Em cada revisão, os integrantes verificaram se a entrega atendia ao objetivo esperado e definido para a atividade. A IA não substituiu esse processo de avaliação nem a decisão da equipe sobre a aceitação do conteúdo produzido.

## 9. Instruções para assistentes de IA

> [!WARNING]
> Ao gerar, revisar ou alterar uma interface do Orbity:

1. Leia, antes de agir, [01-principios.md](01-principios.md), [02-tokens.md](02-tokens.md), [03-fundamentos.md](03-fundamentos.md), os arquivos aplicáveis em [04-componentes/](04-componentes/), [05-padroes.md](05-padroes.md) e [06-acessibilidade.md](06-acessibilidade.md).
2. Verifique no inventário e no código se a tela ou o componente está implementado, parcial ou apenas planejado. Não apresente documentação planejada como funcionalidade concluída.
3. Use exclusivamente os tokens documentados. Não escreva valores literais de cor, espaçamento, tipografia ou raio no código e não crie aliases implícitos.
4. Preserve a anatomia, as variantes e todos os estados documentados do componente, incluindo padrão, hover quando aplicável, pressionado, foco e desabilitado.
5. Respeite os padrões de interação e os requisitos de acessibilidade, incluindo contraste, alvo de toque, foco, semântica, texto ampliado, redução de movimento e indicadores perceptíveis além da cor.
6. Não invente tokens, valores, componentes, estados, telas ou decisões. Se faltar uma definição, solicite esclarecimento ou registre a lacuna no documento adequado antes de implementar.
7. Mantenha a experiência acolhedora, preserve o controle do estudante e não introduza mensagens ou mecânicas punitivas.
8. Ao entregar uma interface, liste os tokens, componentes e padrões utilizados e informe quais validações foram realmente executadas.
