
# Fundamentos

<!-- Regras de USO dos tokens (os valores ficam em 02-tokens.md). Frases curtas, no imperativo, verificáveis. -->

## Cor

- Use `color.action` somente para a ação principal da tela. (Adaptado)
- Nunca use cor como única forma de comunicar um estado; acrescente ícone ou texto. (Herdado)
- Use `color.on-action` para textos e ícones sobre `color.action`. (Adaptado)
- Use `color.on-surface` para textos sobre `color.surface`. (Adaptado)
- Verifique o contraste entre texto e fundo, garantindo pelo menos 4,5:1 para texto comum. (Herdado)
- Use os mesmos tokens semânticos nos modos claro e escuro. (Herdado)

## Tipografia

- Use `font.title` para títulos de tela e `font.body` para texto corrido. (Adaptado)
- Use `font.label` para rótulos de botões e campos. (Adaptado)
- Respeite o tamanho de fonte escolhido pelo usuário no sistema, utilizando os recursos de escala de fonte da plataforma. (Herdado)
- Não transmita informações importantes apenas por meio do tamanho ou peso da fonte. (Adaptado)

## Espaçamento

- Use múltiplos de 8 px para margens e espaços; utilize múltiplos de 4 px para ajustes finos. (Herdado)
- Use `space.md` como Margem interna padrão das telas. (Adaptado)
- Use `space.sm` entre elementos relacionados e `space.lg` para separar grupos. (Adaptado)
- Mantenha espaçamentos consistentes entre elementos com a mesma função. (Adaptado)

## Ícones

- Adote Material Symbols como conjunto padrão de ícones do Orbity. (Adaptado)
- Use ícones de 24 dp como tamanho padrão para ações e elementos de navegação. (Herdado)
- Adicione um rótulo textual aos ícones que não sejam universalmente reconhecíveis. (Adaptado)
- Forneça uma descrição acessível para ícones informativos e nomes acessíveis para controles interativos. (Herdado)

## Elevação

- Use `elevation.card` para destacar cards que precisem de separação visual do fundo. (Adaptado)
- Prefira contraste de superfície ou bordas quando a elevação não for necessária. (Adaptado)
- Não use sombras excessivas nem dependa somente da sombra para comunicar informações. (Adaptado)
- Mantenha a elevação consistente entre elementos com a mesma função. (Adaptado)

## Movimento

- Use animações curtas para fornecer feedback às interações e transições quando houver mudança de contexto. (Adaptado)
- Evite animações decorativas que distraiam ou atrasem tarefas. (Adaptado)
- Respeite a preferência do sistema por movimento reduzido. (Herdado)
- Não dependa de animações para transmitir informações essenciais. (Adaptado)
