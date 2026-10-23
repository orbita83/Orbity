# Painel deslizante de foco (FocusBottomSheet)

> **Referência do padrão F1/F2:** O painel de atividade e foco da Tela Inicial está especificado na [Seção 2 — Navegação e Modo Foco](../05-padroes.md#2-navegação-e-modo-foco-f1-f2). Nesse padrão, o painel ancorado coexiste com a navbar visível nos estágios recolhido, intermediário e expandido; a navbar fica oculta durante uma sessão ativa de foco. Essa integração ainda não está presente nesta branch documental. As restrições descritas abaixo representam a especificação base anterior.

Origem no sistema base: Material 3, Standard e Modal Bottom Sheets. Situação: Adaptado. Motivo da adaptação: organizar o fluxo da Tela Inicial em dois estágios progressivos de abertura (1.1 Modo Foco e Progresso e 1.2 Progresso completo com atalho para Conquistas), garantindo acionamento equivalente por gesto de swipe e por toque na alça, além da ocultação coordenada da barra de navegação inferior.

Referências locais: [05-padroes.md](../05-padroes.md) (Seção 2 — Navegação e Modo Foco, fluxos F1 e F2) e [botao.md](botao.md) (`PrimaryButton` utilizado para a ação “Iniciar”). Na Tela Inicial, o componente posiciona-se na base da tela e complementa o componente de visualização de sequência ([visualizacao-sequencia.md](visualizacao-sequencia.md)).

## Quando usar

- Use na Tela Inicial para revelar o Modo Foco e o acompanhamento de progresso diário por swipe para cima ou por toque na alça.
- Use o primeiro estágio (1.1) para apresentar o resumo de sessões do dia (`"1 | 15"` ou `"Nenhuma sessão hoje"`), a barra de progresso e o botão “Iniciar”.
- Use o segundo estágio (1.2) para exibir o progresso expandido e o atalho navegável “Conquistas >”.
- Oculte a navbar fixa de 5 abas enquanto o painel estiver aberto nos estágios 1.1 ou 1.2.

## Quando não usar

- Não use para formulários de criação de tarefas ou rotinas (F4, F7), que utilizam modal próprio de formulário.
- Não use para alertas de confirmação de exclusão em lote (F6) ou modais de feedback pontual (2.2).
- Não dependa exclusivamente do gesto de arraste (swipe) para abrir, expandir ou recolher o painel.
- Não mantenha a barra de navegação inferior visível em concorrência com o painel aberto.

## Anatomia

1. Superfície do painel: fundo `color.surface`, cantos superiores `radius.lg`, elevação `elevation.card`, espaçamento interno `space.md` e separação entre grupos `space.lg`.
2. Alça de expansão (handle): controle centralizado no topo do painel com alvo interativo mínimo de 48 × 48 dp garantido por `target.min-size`, espaçamento vertical `space.sm` e indicador visual em `color.on-surface`. Os tokens de largura, altura e raio exclusivos do traço visual da alça ainda são lacunas.
3. Resumo de progresso: título e contador de sessões (como `"1 | 15"`) em `font.title` e texto de estado (como `"Nenhuma sessão hoje"`) em `font.body`, ambos em `color.on-surface`, separados por `space.sm`.
4. Barra de progresso: indicador com cantos `radius.md` e preenchimento ativo em `color.action`. Os tokens de altura da barra e de cor da trilha não preenchida para distinção sobre `color.surface` ainda são lacunas.
5. Ação principal “Iniciar”: composta pelo componente `PrimaryButton` (`button.bg`, `button.label`, `button.radius`, `button.min-height`, `button.min-width`, `font.label`).
6. Atalho “Conquistas >” (estágio 1.2): controle navegável com tipografia `font.label`, cor `color.action` ou `color.on-surface`, espaçamento interno `space.sm` e alvo mínimo `target.min-size`.
7. Foco externo: anel na alça e nos controles internos com cor `color.focus`, espessura `focus.ring-width` e afastamento `focus.ring-offset`.

No React Native, os números de dimensão representam unidades lógicas independentes de densidade. Não multiplique os tokens pela densidade física da tela.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Estágio 1.1 (Modo Foco e Progresso) | Aberto no primeiro swipe para cima ou toque na alça; exibe progresso diário, barra de progresso e botão “Iniciar” | `color.surface`, `color.on-surface`, `color.action`, `radius.lg`, `radius.md`, `elevation.card`, `font.title`, `font.body`, `font.label`, `space.sm`, `space.md`, `target.min-size`, `button.bg`, `button.label`, `button.radius` |
| Estágio 1.2 (Progresso expandido) | Aberto no segundo swipe para cima ou novo acionamento da alça; acrescenta visão expandida e o atalho “Conquistas >” | Os mesmos tokens do estágio 1.1, com `space.lg` entre o grupo de progresso e o atalho de conquistas |
| Estado vazio | Exibido quando não há sessões concluídas no dia (“Nenhuma sessão hoje”) com botão “Iniciar” | `color.surface`, `color.on-surface`, `font.body`, `space.md`, `button.bg`, `button.label`, `button.radius` |

Os temas claro e escuro usam os mesmos nomes de tokens semânticos. A transição entre recolhido, estágio 1.1 e estágio 1.2 ocorre no mesmo componente.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Recolhido (inicial) | Superfície `color.surface`, cantos `radius.lg`, elevação `elevation.card` e alça visível | Mantém a Tela Inicial e a navbar de 5 abas ativas; aguarda swipe para cima ou toque na alça | Alça anuncia papel de botão, ação de abrir o painel e `{ expanded: false }` |
| Aberto — Estágio 1.1 | Superfície `color.surface`, `radius.lg`, `elevation.card`, barra em `color.action` e botão `button.bg` | Oculta a navbar inferior; permite iniciar o foco, expandir para 1.2 ou recolher o painel | Transfere o foco para o painel, anuncia `{ expanded: true }` e expõe o progresso e o botão “Iniciar” |
| Expandido — Estágio 1.2 | Superfície `color.surface`, `radius.lg`, `elevation.card`, `space.lg` e atalho “Conquistas >” | Exibe o progresso completo e permite navegar para Conquistas (1.3) ou recolher | Mantém `{ expanded: true }` e confina o foco nos controles visíveis do painel |
| Carregando | Esqueleto (*skeleton*) em `color.surface`, cantos `radius.md` e `motion.duration.short` | Exibe blocos estruturais durante o carregamento das métricas do painel | Expõe `{ busy: true }` por `accessibilityState` |
| Hover | Fundo `button.bg-hover` no botão primário e realce pendente na alça e no atalho; não se aplica em toque | Realça controles interativos ao passar o ponteiro na Web | Não altera o estágio de abertura sem ativação |
| Pressionado | Fundo `button.bg-pressed` no botão “Iniciar” e feedback de toque com `motion.duration.short` na alça | Acompanha o gesto vertical ou alterna o estágio ao concluir o toque na alça | Mantém nome, papel e área interativa mínima `target.min-size` |
| Foco | Anel `color.focus`, `focus.ring-width` e `focus.ring-offset` na alça, no botão “Iniciar” e em “Conquistas >” | Identifica o controle ativo na navegação por teclado | Contraste de 6,29:1 no claro e 6,50:1 no escuro, acima dos 3:1 exigidos para foco |
| Desabilitado | Botão “Iniciar” com `button.bg-disabled` quando indisponível | Bloqueia o disparo duplicado da sessão de foco | Expõe `{ disabled: true }` no controle correspondente |

**Lacunas nos tokens:** `02-tokens.md` ainda não define tokens para as alturas de ancoragem (*snap points*) dos estágios recolhido, 1.1 e 1.2, para as dimensões visuais da barra interna da alça, para a altura e a cor de fundo da trilha não preenchida da barra de progresso (já que painel e trilha referenciam `color.surface` em `05-padroes.md`), nem para *backdrop* ou sombras equivalentes a `elevation.card` no iOS e na Web. Além disso, conforme registrado em `05-padroes.md`, a legenda explicativa do indicador `"1 | 15"`, as telas subsequentes de cronômetro/conclusão do modo foco e os tokens visuais de hover, pressionado e desabilitado permanecem pendentes. Não substitua essas lacunas por valores arbitrários.

## Acessibilidade

- Alternativa ao gesto de swipe (WCAG 2.5.1): toda mudança de estágio acionada por arraste vertical deve poder ser executada por toque simples ou teclado na alça do painel (`accessibilityRole="button"`).
- Alvo de toque mínimo: 48 × 48 dp na alça de expansão, no botão “Iniciar” e no atalho “Conquistas >”, formalizado por `target.min-size`, `button.min-height` e `button.min-width`.
- Contraste padrão: textos em `color.on-surface` sobre `color.surface` resultam em **17,17:1 nos dois temas**. O preenchimento da barra de progresso em `color.action` sobre `color.surface` resulta em **6,29:1 no modo claro** e **6,50:1 no escuro**, e o botão “Iniciar” (`button.label` sobre `button.bg`) mantém **6,29:1 no claro** e **6,50:1 no escuro**.
- Foco: use anel sólido de 2 dp (`focus.ring-width`), afastamento de 2 dp (`focus.ring-offset`) e `color.focus`. Ao abrir o painel, transfira o foco para a alça ou primeiro controle interno, mantenha o confinamento de foco (*focus trap*) enquanto aberto e restaure o foco ao elemento de origem ao recolher.
- Leitor de tela: anuncie na alça o papel de botão, a ação correspondente ao estágio atual e `accessibilityState={{ expanded }}`. Na barra de progresso, exponha `accessibilityRole="progressbar"` e o texto completo do progresso para não depender apenas da barra visual.
- Texto ampliado: preserve `allowFontScaling` em todos os textos, permita crescimento vertical com `minHeight` e habilite rolagem interna (`ScrollView`) quando o conteúdo ampliado até 200% ultrapassar a área do painel.
- Movimento: use `motion.duration.medium` e `motion.easing.standard` na transição entre estágios, respeitando `AccessibilityInfo.isReduceMotionEnabled()` para substituir o deslizamento por atualização instantânea ou opacidade curta (`motion.duration.short`) quando o movimento reduzido estiver ativo.

Os cálculos e as regras completas estão em [06-acessibilidade.md](../06-acessibilidade.md).

## Faça e evite

- **Faça:** permita abrir, expandir e recolher o painel tanto por gesto de swipe quanto por toque na alça.
- **Faça:** garanta saída clara do painel em qualquer estágio e oculte a navbar inferior enquanto o painel estiver aberto.
- **Faça:** reutilize o `PrimaryButton` para o botão “Iniciar” e associe a barra de progresso ao contador textual visível.
- **Evite:** exigir exclusivamente gestos de arraste multiponto ou swipe rápido sem alternativa de toque simples.
- **Evite:** deixar o estudante sem saída ao expandir o painel inferior.
- **Evite:** fixar alturas rígidas em pixels que trunquem os textos ou ocultem o botão “Iniciar” com fonte ampliada.

## Código

O componente está especificado para o fluxo de Navegação e Modo Foco ([05-padroes.md](../05-padroes.md), F1 e F2), ainda sem implementação em `src/view/components/`. A ação principal reutiliza [primary-button.tsx](../../src/view/components/primary-button.tsx) e consome os tokens de [tokens.ts](../../src/view/theme/tokens.ts).

Trecho de referência da estrutura do painel usando exclusivamente tokens documentados:

```tsx
<View style={styles.sheetContainer}>
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={handleLabel}
    accessibilityHint={handleHint}
    accessibilityState={{ expanded: isExpanded }}
    onPress={onToggleStage}
    style={styles.handleTouchTarget}
  >
    <View accessible={false} style={styles.handleIndicator} />
  </Pressable>

  <View style={styles.contentGroup}>
    <Text allowFontScaling style={styles.progressText}>
      {progressSummary}
    </Text>
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={progressAccessibilityLabel}
      style={styles.progressTrack}
    >
      <View style={styles.progressFill} />
    </View>
    <PrimaryButton
      label={startLabel}
      onPress={onStartFocus}
      theme={theme}
    />
  </View>

  {isFullyExpanded && (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={achievementsLabel}
      onPress={onOpenAchievements}
      style={styles.achievementsShortcut}
    >
      <Text allowFontScaling style={styles.shortcutLabel}>
        {achievementsLabel}
      </Text>
    </Pressable>
  )}
</View>
```

O tema resolve `color.surface`, `color.on-surface`, `color.action`, `color.focus`, `space.sm`, `space.md`, `space.lg`, `font.label` e os tokens de `button` a partir de `02-tokens.md`. A exposição de `radius.lg`, `radius.md`, `elevation.card`, `font.title` e `font.body` em `tokens.ts`, bem como as alturas dos estágios 1.1 e 1.2 e os tokens da trilha da barra de progresso, permanecem pendentes das lacunas registradas acima.

Validação necessária em integração: abertura e expansão por swipe e por toque na alça, ocultação e restauração da navbar de 5 abas, confinamento e restauração de foco por teclado, anúncio em TalkBack e VoiceOver, texto ampliado até 200%, respeito à redução de movimento e aparência em ambos os temas.
