
# Fundamentos

<!-- Regras de USO dos tokens (os valores ficam em 02-tokens.md). Frases curtas, no imperativo, verificáveis. -->

## Cor

- Em qualquer tela, use o tema escolhido pelo estudante e os mesmos papéis semânticos. Para a identidade escura cósmica, propague `themes.cosmic` a todos os componentes; os temas anteriores continuam disponíveis para migração. (Adaptado)
- Fundo, card, texto, ação e foco usam os papéis globais de [02-tokens.md](02-tokens.md#variante-cósmica). Gradientes e cores decorativas são contratos separados; o planeta é específico de sua composição. (Adaptado)
- Estados de ação ainda não definidos e contrastes de gradientes exigem validação antes de serem declarados prontos. (Novo)
- Crie destaque com superfície, borda e cor sólida, nunca com brilho colorido em volta de botões, chips, conquistas ou checkbox. O único brilho permitido é `shadow.glow-planet`, na ilustração do planeta. (Novo, 1.2)
- Em qualquer aparência, associe texto ou ícone aos estados e verifique o contraste dos pares utilizados. (Herdado)

Para componentes em qualquer tema:

- Use `color.action` somente para a ação principal da tela e estados ativos destacados. (Adaptado)
- Use `color.action-subtle` para indicadores de estado, pílulas de navegação e cápsulas visuais suaves. (Adaptado)
- Nunca use cor como única forma de comunicar um estado; acrescente ícone ou texto. (Herdado)
- Use `color.on-action` para textos e ícones sobre `color.action`. (Adaptado)
- Use `color.surface` para o fundo principal da tela e `color.surface-variant` para fundos secundários e agrupamentos. (Adaptado)
- Use `color.on-surface` para títulos e textos principais sobre `color.surface`. (Adaptado)
- Use `color.on-surface-variant` para prazos, legendas e textos de apoio secundários. (Adaptado)
- Use `color.border` para bordas delimitadoras e divisores sem gerar ruído visual. (Adaptado)
- Use `color.border-subtle` para o fio de separação de barras fixas, cabeçalhos e painel; reserve `color.focus` para o anel de foco. (Novo, 1.2)
- Use `color.scrim` atrás de modais para separar a camada sem escurecer o conteúdo por completo. (Novo, 1.2)
- Sempre associe ícone semântico e texto explicativo ao utilizar `color.error`, `color.success`, `color.warning` ou `color.info`. (Herdado)
- Verifique o contraste entre texto e fundo, garantindo pelo menos 4,5:1 para texto comum. (Herdado)
- Use os mesmos nomes de tokens semânticos nos modos claro e escuro, alternando apenas os valores vinculados. (Herdado)

## Tipografia

- Use `font.title` para títulos de tela e `font.body` para texto corrido. (Adaptado)
- Use `font.label` para rótulos de botões e campos. (Adaptado)
- Use `font.streak` somente no número da sequência do planeta. (Novo, 1.2)
- Nunca invente tamanhos tipográficos intermediários (ex.: 18 px ou 20 px). Para subtítulos e cabeçalhos de cards, utilize `font.title` ou `font.body` com peso enfático (700 ou 600). (Novo)
- Respeite o tamanho de fonte escolhido pelo usuário no sistema, utilizando os recursos de escala de fonte da plataforma. (Herdado)
- Não transmita informações importantes apenas por meio do tamanho ou peso da fonte. (Adaptado)

## Espaçamento

- Use múltiplos de 8 px para margens e espaços; utilize múltiplos de 4 px para ajustes finos. (Herdado)
- Use `space.md` como Margem interna padrão das telas. (Adaptado)
- Use `space.sm` entre elementos relacionados e `space.lg` para separar grupos. (Adaptado)
- Controles e atalhos interativos em lista devem utilizar obrigatoriamente altura mínima de `target.min-size` (48 dp) e `radius.md`. (Herdado)
- Para elementos de carregamento (esqueleto/skeleton), utilize larguras percentuais (ex.: 60%, 80%, 100%) e alturas alinhadas às alturas de linha tipográficas (`lineHeight`: 32 px para títulos, 24 px para corpo e 20 px para rótulos) com `radius.md`. (Novo)
- Mantenha espaçamentos consistentes entre elementos com a mesma função. (Adaptado)
- Em grupos de controles lado a lado (chips, campos em linha), divida a linha em colunas de largura igual, com `minmax(0, 1fr)` na Web e `flex: 1` com `minWidth: 0` no app, alinhadas às bordas do botão e dos cards. (Novo, 1.2)

## Ícones

- Adote Material Symbols como conjunto padrão de ícones do Orbity. (Adaptado)
- Use ícones de 24 dp como tamanho padrão para ações e elementos de navegação. (Herdado)
- Adicione um rótulo textual aos ícones que não sejam universalmente reconhecíveis. (Adaptado)
- Na navbar, use `home`, `description`, `autorenew`, `star` e `person` para Início, Tarefas, Rotinas, Cosmos e Perfil. `star` substitui `auto_awesome` na 1.2; `autorenew` permanece para Rotinas porque representa repetição. (Adaptado, 1.2)
- Forneça uma descrição acessível para ícones informativos e nomes acessíveis para controles interativos. (Herdado)

## Elevação

- Use `elevation.card` para destacar cards que precisem de separação visual do fundo. (Adaptado)
- Prefira contraste de superfície ou bordas quando a elevação não for necessária. (Adaptado)
- Não use sombras excessivas nem dependa somente da sombra para comunicar informações. (Adaptado)
- Use as sombras escuras da 1.2 por camada: `shadow.bar` em barras inferiores, `shadow.bar-top` em cabeçalhos fixos, `shadow.sheet` no painel, `shadow.button` no botão principal e `shadow.modal` em modais. (Novo, 1.2)
- Mantenha a elevação consistente entre elementos com a mesma função. (Adaptado)

## Movimento

- Use animações curtas para fornecer feedback às interações e transições quando houver mudança de contexto. (Adaptado)
- Evite animações decorativas que distraiam ou atrasem tarefas. (Adaptado)
- Para feedback tátil de toque em cards e listas (`pressed`), utilize redução de opacidade padronizada para 0.8 (ou variação de superfície no modo claro acompanhada de indicador com contraste perceptível no modo escuro). (Novo)
- Em botões, ícones, abas e links, combine `motion.scale-pressed` (0,96) com `motion.opacity-pressed` (0,8) em `motion.duration.short` e `motion.easing.standard`. (Novo, 1.2)
- Com movimento reduzido, desligue a escala ao toque, a rotação e o pulso do planeta; mantenha apenas a opacidade. (Novo, 1.2)
- Esconda a barra de rolagem visível nas telas do app; a rolagem continua pelo toque, pela roda e pelo teclado. (Novo, 1.2)
- Respeite a preferência do sistema por movimento reduzido. (Herdado)
- Não dependa de animações para transmitir informações essenciais. (Adaptado)
