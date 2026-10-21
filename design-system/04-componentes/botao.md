# Botão primário (PrimaryButton)

Origem no sistema base: Material 3, Filled button. Situação: Adaptado. Motivo da adaptação: aplicar as cores de ação, a forma e as regras oficiais de acessibilidade do Orbity à ação principal da tela.

Aplicação no Orbity: o componente corresponde à ação “+ Nova tarefa” do fluxo de criação descrito em [05-padroes.md](../05-padroes.md) e representa a ação principal da tela. A aparência e o comportamento seguem os [tokens do ODS](../02-tokens.md), os estados e os critérios de acessibilidade documentados abaixo.

## Quando usar

- Use para a ação principal da tela, como abrir o formulário de nova tarefa.
- Na lista de tarefas, posicione “Nova tarefa” após os filtros e antes da lista.
- Execute a ação somente após a ativação pelo estudante.

## Quando não usar

- Não use para os filtros “Todos”, “Pendentes” e “Concluídas”: eles representam seleção.
- Não use para marcar uma tarefa como concluída, abrir o menu de opções ou compor a navegação inferior.
- Não use a mesma ênfase para várias ações concorrentes na mesma tela.
- Não use esta variante para exclusão de tarefas; ações destrutivas precisam de especificação própria.

## Anatomia

1. Área interativa: fundo `button.bg`, cantos `button.radius`, altura mínima `button.min-height`, largura mínima `button.min-width`, `space.md` na horizontal e `space.sm` na vertical.
2. Rótulo: `button.label` e `font.label`, centralizado, escalável e sem truncamento.
3. Ícone opcional: Material Symbols `add`, antes do rótulo, separado por `space.sm`, na mesma cor do texto. O token de tamanho do ícone ainda é uma lacuna.
4. Foco externo: cor `button.focus-color`, espessura `button.focus-width` e afastamento `button.focus-offset`. O espaço é reservado sem foco para evitar deslocamento do conteúdo.
5. Alvo de toque: mínimo de 48 × 48 dp por meio de `button.min-height` e `button.min-width`. A altura cresce para acomodar texto ampliado.

No React Native, os números de dimensão representam unidades lógicas independentes de densidade. Não multiplique os tokens pela densidade física da tela.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Primário com texto | Ação principal cujo rótulo é suficiente | `button.bg`, `button.label`, `button.radius`, `button.min-height`, `button.min-width`, `font.label`, `space.sm`, `space.md` |
| Primário com ícone e texto | “Nova tarefa”; o ícone reforça a ação | Os mesmos tokens, com `space.sm` entre ícone e texto; token de tamanho do ícone pendente |

A variante somente com ícone não faz parte deste componente. Os temas claro e escuro usam os mesmos nomes de tokens.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Fundo `button.bg`, texto `button.label`, tipografia `font.label` | Abre o formulário ao ativar “Nova tarefa” | Expõe nome e papel de botão |
| Hover | Fundo `button.bg-hover`; demais tokens mantidos | Realça ao passar o ponteiro; não se aplica em toque | Não revela informação exclusiva nem executa a ação |
| Pressionado | Fundo `button.bg-pressed`; rótulo mantido | Fornece feedback durante o toque; executa ao concluir a ativação | Mantém nome, papel e área interativa |
| Foco | Anel `button.focus-color`, `button.focus-width` e `button.focus-offset` | Identifica o controle na navegação por teclado | Contraste de 6,29:1 no claro e 6,50:1 no escuro, acima dos 3:1 exigidos para foco |
| Desabilitado | Fundo `button.bg-disabled`; aparência textual pendente | Bloqueia a ativação | Expõe `{ disabled: true }` por `accessibilityState`; explique o motivo em texto próximo quando necessário |

Prioridade dos fundos: desabilitado, pressionado, hover, padrão. O foco é independente do fundo.

**Lacunas nos tokens:** `button.bg-hover`, `button.bg-pressed` e `button.bg-disabled` ainda não possuem cores, opacidades ou composições definidas nos dois temas. Também faltam o token de texto desabilitado e o token de tamanho do ícone. Não substitua essas lacunas por valores arbitrários. A implementação atual entrega o comportamento e a semântica do estado desabilitado, mantendo o visual padrão até a definição dos tokens.

## Acessibilidade

- Alvo de toque mínimo: 48 × 48 dp, formalizado por `target.min-size`, `button.min-height` e `button.min-width`.
- Contraste padrão: `button.label` sobre `button.bg` resulta em **6,29:1 no modo claro** e **6,50:1 no escuro**, acima do mínimo de 4,5:1 para `font.label`.
- Foco: use anel sólido de 2 dp, afastamento de 2 dp e `button.focus-color`. Não remova o indicador sem alternativa equivalente.
- Leitor de tela: anuncie o rótulo, o papel de botão e o estado desabilitado. Use `accessibilityHint` somente quando a consequência não estiver clara no rótulo.
- Ícone acompanhado pelo mesmo texto é decorativo e deve ser ocultado do leitor de tela para evitar anúncio duplicado.
- Texto ampliado: preserve `allowFontScaling`, permita quebra de linha e crescimento vertical; não use `height`, `numberOfLines` ou truncamento no rótulo.
- Ordem de foco: filtros, “Nova tarefa” e controles das tarefas. Ao abrir o formulário, transfira o foco para o primeiro controle e restaure-o ao botão quando o formulário for fechado.
- Movimento: o componente não depende de animação. Se for adicionada, use os tokens de movimento e respeite a preferência do sistema por movimento reduzido.

Os cálculos e as regras completas estão em [06-acessibilidade.md](../06-acessibilidade.md).

## Faça e evite

- **Faça:** use um rótulo que explique a ação e mantenha a criação sob controle do estudante.
- **Faça:** use os tokens do tema ativo, mantenha o alvo de 48 × 48 dp e preserve o foco visível.
- **Evite:** usar apenas “+” como rótulo ou anunciar o ícone e o texto separadamente.
- **Evite:** fixar a altura do botão ou truncar seu rótulo.
- **Evite:** reutilizar este botão como filtro selecionável ou checkbox.
- **Evite:** inferir cores, bordas ou medidas a partir de referências visuais; siga os tokens documentados.

## Código

A implementação está em [primary-button.tsx](../../src/view/components/primary-button.tsx) e pode ser visualizada pelas [histórias do Storybook](../../src/view/components/primary-button.stories.tsx). Execute `npm run storybook`, abra `http://localhost:6006` e use Tab para inspecionar o foco.

Trecho real da variante com texto:

```tsx
<View style={styles.focusContainer}>
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityHint={accessibilityHint}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    onFocus={() => setIsFocused(true)}
    onBlur={() => setIsFocused(false)}
    style={styles.button}
  >
    <Text allowFontScaling style={styles.label}>
      {label}
    </Text>
  </Pressable>
</View>
```

O tema resolve `button.min-height`, `button.min-width`, `button.focus-color`, `button.focus-width` e `button.focus-offset` a partir de `02-tokens.md`. A aparência de hover, pressionado e desabilitado permanece pendente das lacunas registradas acima.

Validação necessária em integração: interação por toque e teclado, anúncio em TalkBack e VoiceOver, texto ampliado até 200%, restauração de foco após fechar o formulário e aparência em ambos os temas.
