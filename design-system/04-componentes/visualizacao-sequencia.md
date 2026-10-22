# Visualização de sequência (PlanetStreakView)

> **Implementação atual do protótipo:** `src/view/components/planet-streak-view.tsx` compõe o visualizador vetorial `PlanetIllustration` e o contador central, recebendo `streakDays` da ViewModel. A direção vigente, os tokens, os limites funcionais e a revisão por Storybook estão em [07-home-cosmica.md](../07-home-cosmica.md). A rotação axial e a evolução por ponto descritas abaixo permanecem especificações futuras, não funcionalidades entregues.

Origem no sistema base: sem equivalente direto no Material 3. Situação: Novo. Motivo da criação: representar a constância de estudos por meio de um planeta 2D dinâmico que evolui a cada ponto de continuação na sequência e rotaciona sobre o próprio eixo durante o modo foco, materializando o princípio de valorizar a trajetória sem mecânicas punitivas.

Referências locais: [01-principios.md](../01-principios.md) (Princípio 1) e [05-padroes.md](../05-padroes.md) (Seção 2 — Navegação e Modo Foco, fluxo F2, e Seção 8 — Perfil, fluxo F10). Na Tela Inicial, o componente ocupa a região central da tela, acima do painel deslizante de foco e progresso.

## Quando usar

- Use na Tela Inicial como representação central da sequência ativa de estudos e do estado atual do modo foco.
- Use para refletir dinamicamente cada ponto de continuação na sequência por meio de modificações visuais progressivas no planeta 2D.
- Ative a rotação do planeta 2D sobre o próprio eixo exclusivamente enquanto uma sessão de modo foco estiver em andamento.
- Associe sempre a ilustração do planeta a um rótulo textual explícito com a contagem da sequência e o estado atual.

## Quando não usar

- Não use em listas densas de tarefas, formulários modais (F4, F7) ou barras de navegação inferior e contextual.
- Não use para indicar a conclusão isolada de uma tarefa ou hábito individual; use checkboxes ou barras de progresso.
- Não aplique regressões visuais destrutivas, cores de erro (`color.error`) ou mensagens punitivas ao planeta quando a sequência for interrompida.
- Não mantenha a rotação axial contínua fora do modo foco ou quando a preferência do sistema por redução de movimento estiver ativa.

## Anatomia

1. Container orbital: fundo `color.surface`, espaçamento interno `space.lg` e separação `space.md` entre a representação do planeta e os textos de sequência.
2. Corpo do planeta 2D e camadas evolutivas: superfície principal composta com `color.action` e `color.surface`, podendo empregar os primitivos da paleta cósmica (`blue-600`, `purple-200`, `purple-400`, `purple-500` e `purple-600`) conforme mapeamento do tema. Cada ponto de continuação na sequência adiciona ou transforma elementos visuais do planeta (superfície base, faixas atmosféricas, anéis orbitais e satélites). Os tokens de diâmetro do planeta, raio circular 2D e mapeamento semântico de cada estágio evolutivo ainda são lacunas.
3. Eixo de rotação 2D em modo foco: transformação planar de rotação sobre o próprio eixo central do planeta enquanto a sessão de foco está ativa. Os tokens de duração do ciclo completo de rotação contínua e de curva linear ainda são lacunas.
4. Contador e descrição da sequência: valor numérico da sequência em `font.title` e rótulo descritivo do estágio ou estado em `font.body` ou `font.label`, ambos na cor `color.on-surface`, centralizados, escaláveis e sem truncamento, separados por `space.sm`.
5. Foco externo e área interativa (quando acionável): anel na cor `color.focus`, espessura `focus.ring-width` e afastamento `focus.ring-offset`, reservando espaço sem deslocar o layout e garantindo alvo mínimo de 48 × 48 dp via `target.min-size`.

No React Native, os números de dimensão representam unidades lógicas independentes de densidade. Não multiplique os tokens pela densidade física da tela.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Principal (Tela Inicial) | Exibe o planeta 2D estático modificado pelos pontos acumulados na sequência | `color.surface`, `color.on-surface`, `color.action`, `font.title`, `font.body`, `space.sm`, `space.md`, `space.lg` |
| Modo foco ativo | Exibe o planeta 2D em rotação contínua sobre o próprio eixo durante a sessão de foco | Os mesmos tokens da variante principal, com `motion.duration.medium` e `motion.easing.standard` na entrada do estado; token de duração do ciclo axial pendente |
| Resumo compacto | Exibição estática associada às métricas acumuladas do estudante | `color.surface`, `color.on-surface`, `color.action`, `font.title`, `font.label`, `space.sm`, `space.md`, `radius.lg`, `elevation.card` |

Os temas claro e escuro usam os mesmos nomes de tokens semânticos. Cada ponto de continuação na sequência modifica o planeta de forma cumulativa.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão (em sequência) | Superfície `color.surface`, destaque `color.action`, textos `color.on-surface` em `font.title` e `font.body` | Exibe o planeta 2D estático com as modificações correspondentes aos pontos atuais na sequência | Anuncia a contagem da sequência e o estágio visual alcançado pelo planeta |
| Evolução de sequência | Transição com `motion.duration.medium` e `motion.easing.standard`; destaque `color.action` | Modifica o planeta ao registrar novo ponto de continuação na sequência | Anuncia a atualização em região ativa (`accessibilityLiveRegion="polite"`) |
| Modo foco (em rotação) | Planeta 2D rotacionando sobre o próprio eixo; destaque em `color.action` | Inicia a rotação axial ao disparar o modo foco (F2) e substitui por estado estático se `reduceMotion` estiver ativo | Expõe `{ busy: true }` por `accessibilityState` e anuncia o modo foco em andamento |
| Hover | Aparência de realce pendente quando interativo; não se aplica em toque | Realça ao passar o ponteiro na Web sem iniciar a rotação axial | Não revela informação exclusiva nem altera a sequência |
| Pressionado | Feedback de toque com `motion.duration.short` quando acionável | Aciona a abertura do detalhe ou do painel de foco ao concluir o toque | Mantém nome, papel e área interativa mínima `target.min-size` |
| Foco | Anel `color.focus`, `focus.ring-width` e `focus.ring-offset` | Identifica o componente na navegação por teclado quando interativo | Contraste de 6,29:1 no claro e 6,50:1 no escuro, acima dos 3:1 exigidos para foco |
| Pausa na sequência (inativo) | Mantém `color.surface` e `color.on-surface`, sem aplicar `color.error` | Preserva o planeta em repouso sem destruir as modificações conquistadas | Anuncia o histórico acumulado em tom encorajador, sem mensagens punitivas |

**Lacunas nos tokens:** `02-tokens.md` ainda não define tokens de componente para o diâmetro do planeta 2D, o raio circular da esfera, as cores semânticas de cada camada evolutiva do planeta (além de `color.action`), os limiares numéricos de evolução da sequência, nem a duração e o *easing* linear da rotação axial contínua de 360° em modo foco (`motion.duration.short` e `motion.duration.medium` cobrem apenas interações de 100 ms e transições de 300 ms). Também permanecem pendentes os tokens visuais de hover, pressionado e inativo. Não substitua essas lacunas por valores literais arbitrários.

## Acessibilidade

- Alvo de toque mínimo: quando o componente for acionável, assegure 48 × 48 dp por meio de `target.min-size`.
- Contraste padrão: textos em `color.on-surface` sobre `color.surface` resultam em **17,17:1 nos modos claro e escuro**, acima do mínimo de 4,5:1 para `font.body`/`font.label` e de 3,0:1 para `font.title`. Destaques gráficos em `color.action` sobre `color.surface` resultam em **6,29:1 no claro** e **6,50:1 no escuro**, superando o mínimo de 3,0:1 para elementos gráficos (WCAG 1.4.11).
- Independência de cor e animação: nunca transmita a pontuação da sequência ou a atividade do modo foco apenas pelas modificações visuais ou pela rotação do planeta; mantenha sempre o texto de contagem e de status visível.
- Foco: use anel sólido de 2 dp (`focus.ring-width`), afastamento de 2 dp (`focus.ring-offset`) e cor `color.focus`.
- Leitor de tela: forneça `accessibilityLabel` que descreva a contagem da sequência, o estágio atual do planeta e se o modo foco está ativo. Oculte camadas gráficas internas puramente decorativas do planeta com `accessible={false}` ou `importantForAccessibility="no-hide-descendants"`.
- Texto ampliado: preserve `allowFontScaling`, permita quebra de linha e crescimento vertical do bloco textual; não use `height`, `numberOfLines` ou truncamento nos rótulos.
- Movimento: consulte `AccessibilityInfo.isReduceMotionEnabled()`. Quando a preferência por movimento reduzido estiver ativa, desative a rotação contínua do planeta 2D sobre o próprio eixo no modo foco e mantenha apenas o indicador estático e textual. Não use efeitos que pisquem mais de 3 vezes por segundo.

Os cálculos e as regras completas estão em [06-acessibilidade.md](../06-acessibilidade.md).

## Faça e evite

- **Faça:** modifique o planeta a cada ponto de continuação na sequência e acompanhe a evolução com rótulo textual claro.
- **Faça:** restrinja a rotação 2D sobre o próprio eixo ao modo foco ativo e respeite a preferência do sistema por redução de movimento.
- **Faça:** preserve o aspecto conquistado do planeta e valorize o esforço acumulado mesmo após pausas na rotina.
- **Evite:** regredir o planeta a estados destrutivos ou usar `color.error` para sinalizar interrupção de sequência.
- **Evite:** comunicar o estágio da sequência ou o modo foco exclusivamente por cor ou animação.
- **Evite:** declarar tamanhos da esfera, durações de rotação ou cores hexadecimais literais fora de `02-tokens.md`.

## Código

O componente está especificado para a Tela Inicial e o Modo Foco ([05-padroes.md](../05-padroes.md), fluxo F2), ainda sem implementação em `src/view/components/`. Os tokens disponíveis são consumidos a partir de [tokens.ts](../../src/view/theme/tokens.ts).

Trecho de referência da estrutura acessível usando exclusivamente tokens documentados:

```tsx
<View
  accessible
  accessibilityRole="summary"
  accessibilityLabel={accessibilityLabel}
  accessibilityState={{ busy: isFocusMode }}
  accessibilityLiveRegion="polite"
  style={styles.container}
>
  <View
    accessible={false}
    importantForAccessibility="no-hide-descendants"
    style={[styles.planetSurface, isFocusMode && !reduceMotion && styles.planetFocusActive]}
  />
  <View style={styles.textGroup}>
    <Text allowFontScaling style={styles.streakTitle}>
      {streakLabel}
    </Text>
    <Text allowFontScaling style={styles.stageDescription}>
      {stageDescription}
    </Text>
  </View>
</View>
```

O tema resolve `color.surface`, `color.on-surface`, `color.action`, `color.focus`, `space.sm`, `space.md`, `space.lg` e `font.label` a partir de `02-tokens.md`. A exposição de `font.title` e `font.body` em `tokens.ts`, bem como as dimensões geométricas do planeta 2D, as camadas de evolução por ponto de sequência e a duração do ciclo de rotação axial em modo foco, permanecem pendentes das lacunas registradas acima.

Validação necessária em integração: evolução visual a cada ponto de continuação na sequência, rotação 2D sobre o próprio eixo durante o modo foco, desativação imediata da rotação com `AccessibilityInfo.isReduceMotionEnabled()`, anúncio em TalkBack e VoiceOver, texto ampliado até 200% e aparência nos temas claro e escuro.
