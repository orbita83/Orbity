# Barra de navegação inferior (NavBar)

Origem no sistema base: Material 3, Navigation Bar. Situação: Adaptado. Motivo da adaptação: aplicar a paleta semântica do Orbity, padronizar cinco destinos fixos com ícones do Material Symbols e rótulos simultâneos, incorporar regras estritas de acessibilidade (WCAG 2.1 AA) e integrar o comportamento dinâmico de ocultação nos fluxos de Modo Foco e Seleção Múltipla.

Referências locais: [05-padroes.md](../05-padroes.md) (Fluxos F1 de Navegação, F2 de Modo Foco e F6 de Seleção Múltipla), [01-principios.md](../01-principios.md) (Princípios 1, 2 e 3) e [06-acessibilidade.md](../06-acessibilidade.md). O componente materializa a navegação primária de primeiro nível do estudante entre os módulos centrais do aplicativo.

## Quando usar

- Use como controle de navegação primária global de nível superior em dispositivos móveis.
- Use para alternar de maneira previsível entre as cinco áreas centrais: **Início**, **Tarefas**, **Rotinas**, **Cosmos** e **Perfil**.
- Posicione fixo no rodapé da viewport (*bottom-anchored*), acima da área segura (*safe area*) do dispositivo.
- Mantenha sempre a aba corrente claramente identificada por múltiplos indicadores visuais e semânticos.

## Quando não usar

- Não use em fluxos lineares, telas de onboarding (F0), formulários modais ou telas de detalhes profundos.
- Não use durante o Modo Foco (F2) nem durante o modo de seleção múltipla de tarefas (F6): nesses estados a barra deve ser ocultada ou ceder espaço para a Barra de Ações Contextuais (CAB).
- Não use como barra de filtros internos ou seleção de abas secundárias dentro de uma mesma tela (ex.: "Todos", "Pendentes", "Concluídas").
- Não use com menos de três ou mais de cinco destinos, preservando o modelo mental e a ergonomia de toque do estudante.

## Anatomia

1. **Container da barra:** largura total (100%), fundo `navbar.bg` (`color.surface`), elevação `navbar.elevation` (`elevation.card`), borda superior sutil em `neutral-200` (modo claro) ou `neutral-900` (modo escuro), preenchimento horizontal `space.md` e preenchimento vertical ajustado para manter alvos ergonômicos.
2. **Destino de navegação (Tab Item):** largura flexível (`flex: 1`), centralizado, área interativa com altura mínima `navbar.min-height` (`target.min-size` de 48 dp) e largura mínima de 48 dp, assegurando alvo de toque contínuo de pelo menos 48 × 48 dp.
3. **Indicador de aba ativa (Pill):** cápsula visual que delimita o ícone selecionado com fundo `navbar.indicator-bg` (`purple-200` no modo claro; `purple-600` no modo escuro) e cantos arredondados com `radius.lg`.
4. **Ícones Material Symbols (24 dp):** dimensão `navbar.icon-size` (lacuna de token primitivo formalizada como 24 dp conforme [03-fundamentos.md](../03-fundamentos.md)). Variação preenchida (`FILL 1`) para o item ativo e contorno (`FILL 0`) para os itens inativos:
   - Início: glifo `home`
   - Tarefas: glifo `description` (folha de caderno / notas de estudo)
   - Rotinas: glifo `autorenew`
   - Cosmos: glifo `auto_awesome`
   - Perfil: glifo `person`
   Cor do ícone: `navbar.item-inactive` (`color.on-surface`) no inativo e `navbar.item-active` (`color.action`) no ativo. Ocultado de leitores de tela para evitar redundância com o rótulo textual (`accessible={false}`).
5. **Rótulo de texto:** rótulo sempre visível abaixo do ícone com tipografia `font.label` (12–14 px, peso 500 no inativo e peso 700 no ativo), com `allowFontScaling={true}` habilitado e sem truncamento rígido.
6. **Indicador externo de foco:** anel sólido em `navbar.focus-color` (`color.focus`), espessura `navbar.focus-width` (`focus.ring-width` de 2 dp) e afastamento `navbar.focus-offset` (`focus.ring-offset` de 2 dp), com raio acompanhando `radius.md`.

## Variantes

| Variante | Uso | Tokens |
| :--- | :--- | :--- |
| **Fixa padrão (5 abas)** | Navegação padrão no rodapé de todas as telas primárias | `navbar.bg`, `navbar.item-active`, `navbar.item-inactive`, `navbar.indicator-bg`, `navbar.min-height`, `navbar.elevation`, `font.label`, `space.sm`, `space.md`, `radius.md`, `radius.lg` |
| **Oculta / Suspensa** | Ocultação durante o Modo Foco ativo (F2) ou substituída pela barra contextual CAB (F6) | Comportamento condicional de renderização / animação via `motion.duration.short` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| :--- | :--- | :--- | :--- |
| **Padrão (Inativo)** | Fundo `navbar.bg`, ícone e texto em `navbar.item-inactive` (`color.on-surface`), tipografia `font.label` | Navega para a aba correspondente ao receber toque ou clique | Expõe papel de aba (`tab`), rótulo e `{ selected: false }` |
| **Ativo (Selecionado)** | Fundo do indicador `navbar.indicator-bg`, ícone preenchido e rótulo em negrito em `navbar.item-active` (`color.action`) | Indica a tela atual do estudante; toque repetido rola a tela ao topo | Expõe papel de aba (`tab`), rótulo e `{ selected: true }` |
| **Hover** | Destaque sutil com leve realce no fundo do item; demais tokens mantidos | Realça o item sob o cursor em ambientes desktop/web; não se aplica a telas de toque | Não transmite informação exclusiva nem executa navegação |
| **Pressionado** | Fundo comprimido ou transição imediata de opacidade durante o toque | Feedback tátil imediato em `motion.duration.short` (100 ms) | Mantém a área de toque intacta e legível |
| **Foco** | Anel visível de 2 dp em `navbar.focus-color` com 2 dp de afastamento | Identifica a aba na navegação por teclado (Tab / Shift+Tab ou setas direcionais) | Razão de contraste de 6,29:1 no claro e 6,50:1 no escuro (acima dos 3:0 exigidos pela WCAG 1.4.11) |
| **Desabilitado** | *Não aplicável* | Todas as abas principais permanecem acessíveis ao estudante | Evita desorientação; telas sem dados exibem estados vazios acolhedores em vez de abas bloqueadas |

**Lacunas nos tokens:** O tamanho dos ícones de 24 dp é estabelecido na Seção de Fundamentos (`03-fundamentos.md`), mas ainda não possui token primitivo formalizado na tabela de `02-tokens.md` (proposta: `icon.size.md: 24 dp`). Os tokens de componente `navbar.*` foram formalizados em `02-tokens.md` e espelhados em `tokens.ts`.

## Acessibilidade

- **Alvo de toque mínimo:** Cada item interativo possui dimensão mínima de **48 × 48 dp** assegurada por `target.min-size` e flexão vertical elástica, atendendo ao Material 3 e aos critérios WCAG 2.5.5 / 2.5.8.
- **Contraste de pares semânticos:**
  - Item inativo: `color.on-surface` sobre `color.surface` atinge **17,17:1** tanto no tema claro quanto no escuro (muito acima do limiar de 4,5:1).
  - Item ativo: `color.action` sobre `color.surface` atinge **6,29:1** no tema claro e **6,50:1** no escuro, superando a exigência de 4,5:1 para texto normal e 3,0:1 para elementos de interface.
  - Indicador de foco: `color.focus` sobre `color.surface` atinge **6,29:1** (claro) e **6,50:1** (escuro), acima dos 3,0:1 exigidos pela WCAG 2.4.11.
- **Leitor de tela (TalkBack, VoiceOver e Web):**
  - O container da barra declara `accessibilityRole="tablist"`.
  - Cada item declara `accessibilityRole="tab"`.
  - O estado dinâmico é exposto via `accessibilityState={{ selected: isActive }}`.
  - Cada aba fornece `accessibilityLabel` claro e estruturado, no formato: `"Aba [Nome], [Posição] de 5"` (ex.: *"Aba Início, 1 de 5"*).
  - Os glifos de ícone internos são decorativos em relação ao texto visível, sendo marcados com `accessible={false}` para evitar leitura duplicada.
- **Independência de cor (WCAG 1.4.1):** A aba selecionada combina múltiplos indicadores perceptíveis além da cor: alteração no peso tipográfico do rótulo (negrito), variação do glifo (contorno vs. preenchido) e indicador geométrico de fundo (*pill*).
- **Texto ampliado (WCAG 1.4.4):** Preserva `allowFontScaling={true}`, utiliza containers flexíveis com `minHeight` e padding proporcional sem travar `height` fixo e sem truncar o texto do rótulo, permitindo acomodar ampliações de fonte de até 200%.
- **Navegação por teclado:** O estudante pode percorrer as abas sequencialmente com `Tab` ou setas do teclado, visualizando com clareza o anel de foco de 2 dp sem corte.

## Faça e evite

- **Faça:** Exiba simultaneamente ícone e rótulo de texto em todas as cinco abas para reforçar o reconhecimento cognitivo.
- **Faça:** Respeite o mapeamento padronizado de glifos do Material Symbols (`home`, `description`, `autorenew`, `auto_awesome`, `person`).
- **Faça:** Oculte ou substitua a barra inferior quando o estudante estiver em Modo Foco (F2) ou Seleção Múltipla de tarefas (F6).
- **Faça:** Preserve o foco acessível de 2 dp com offset de 2 dp e cores do tema ativo.
- **Evite:** Ocultar rótulos das abas inativas (padrão de ícone isolado que compromete a usabilidade e a acessibilidade).
- **Evite:** Usar valores numéricos literais (*hardcoded*) de cor, padding ou raio na estilização da barra.
- **Evite:** Inserir mais de cinco abas na navegação inferior, o que causaria sobreposição de alvos de toque em telas estreitas.
- **Evite:** Bloquear ou desabilitar silenciosamente abas da navegação principal.

## Código

A implementação está em [src/view/components/nav-bar.tsx](../../src/view/components/nav-bar.tsx) e pode ser visualizada e inspecionada nas [histórias do Storybook](../../src/view/components/nav-bar.stories.tsx). Execute `npm run storybook`, abra o navegador e utilize as teclas `Tab` e `Shift+Tab` para testar o foco, ou alterne o tema na barra de ferramentas.

Trecho ilustrativo do componente:

```tsx
<View
  accessibilityRole="tablist"
  style={styles.container}
>
  {NAV_TABS.map((tab, index) => {
    const isActive = activeTab === tab.id;
    const isFocused = focusedTabId === tab.id;

    return (
      <View
        key={tab.id}
        style={[
          styles.focusContainer,
          isFocused && styles.focusContainerActive,
        ]}
      >
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel={`Aba ${tab.label}, ${index + 1} de ${NAV_TABS.length}`}
          accessibilityState={{ selected: isActive }}
          accessibilityHint={tab.accessibilityHint}
          onPress={() => onSelectTab(tab.id)}
          onFocus={() => setFocusedTabId(tab.id)}
          onBlur={() => setFocusedTabId(null)}
          style={styles.tabItem}
        >
          <View
            style={[
              styles.iconIndicator,
              isActive && styles.iconIndicatorActive,
            ]}
          >
            <MaterialSymbol
              name={tab.iconSymbol}
              filled={isActive}
              color={isActive ? theme.navbar.itemActive : theme.navbar.itemInactive}
              size={theme.navbar.iconSize}
            />
          </View>
          <Text
            allowFontScaling
            style={[
              styles.label,
              isActive ? styles.labelActive : styles.labelInactive,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      </View>
    );
  })}
</View>
```
