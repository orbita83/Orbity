# Teste com IA

Este documento registra o processo experimental de validação do **Orbity Design System (ODS)** conduzido com assistente de inteligência artificial em ambiente isolado, conforme os critérios de avaliação da atividade prática de IHC + PDM.

---

## 1. Protocolo e Critérios de Avaliação

- **Premissa fundamental:** *"Quem erra é o texto, não a IA: cada desvio mostra uma regra ausente ou ambígua."*
- **Seleção de tela:** **Tela de Perfil (F10)**, especificada no fluxo 8 de [05-padroes.md](05-padroes.md). Essa tela não foi utilizada como exemplo em nenhum dos componentes de [04-componentes/](04-componentes/), constituindo um teste cego legítimo da capacidade prescritiva do sistema.
- **Isolamento de contexto:** O assistente avaliado recebeu exclusivamente a pasta `design-system/`, sem histórico prévio de conversas, sem acesso a regras de governança interna do repositório (`AGENTS.md`) e sem as instruções desta issue/avaliação.

---

## 2. Rodada 1

- **Ferramenta e modelo:** Subagente de IA isolado operando com **Gemini 2.5 Flash** via Antigravity Harness.
- **Material entregue à IA:** Exclusivamente os 11 arquivos de especificação da pasta `design-system/`:
  - `01-principios.md`
  - `02-tokens.md`
  - `03-fundamentos.md`
  - `05-padroes.md`
  - `06-acessibilidade.md`
  - `04-componentes/` (`botao.md`, `card-tarefa.md`, `chips-filtro.md`, `navbar.md`, `painel-deslizante.md`, `visualizacao-sequencia.md`).
- **Prompt usado:**

> "Você é um desenvolvedor de interface React Native. Sua tarefa é implementar a **Tela de Perfil (F10)** do aplicativo **Orbity** em React Native com TypeScript.
> 
> INSTRUÇÃO CRÍTICA:
> Você deve utilizar **exclusivamente** o sistema de design fornecido abaixo (arquivos da documentação do Orbity Design System). Não invente cores, tamanhos de fonte, espaçamentos, raios de borda, elevações ou dimensões que não estejam definidos nos tokens e padrões fornecidos. Respeite todos os requisitos de acessibilidade (como áreas de toque mínimas de 48 dp e contrastes mínimos) e preveja os estados da tela especificados no fluxo F10 de 05-padroes.md.
> 
> Forneça o código completo do componente ProfileScreen.tsx em React Native com TypeScript, acompanhado de breves explicações sobre quais tokens foram utilizados em cada elemento."

### Resultado da Rodada 1 (Trecho representativo dos estilos gerados)

```tsx
// Trechos extraídos do ProfileScreen.tsx gerado na Rodada 1:
const styles = StyleSheet.create({
  avatarBadge: {
    width: 64, // DESVIO: dimensão arbitrária não tabelada
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SYSTEM_TOKENS.spacing.sm,
  },
  welcomingTitle: {
    fontFamily: SYSTEM_TOKENS.typography.title.fontFamily,
    fontSize: 18, // DESVIO: tamanho tipográfico intermediário inventado
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: SYSTEM_TOKENS.spacing.sm,
  },
  metricCard: {
    flex: 1,
    borderRadius: SYSTEM_TOKENS.radius.lg,
    paddingVertical: SYSTEM_TOKENS.spacing.md,
    paddingHorizontal: SYSTEM_TOKENS.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: SYSTEM_TOKENS.elevation.card,
    minHeight: 88, // DESVIO: altura fixa arbitrária
  },
  shortcutChevron: {
    fontFamily: SYSTEM_TOKENS.typography.title.fontFamily,
    fontSize: 20, // DESVIO: tamanho tipográfico intermediário inventado
    fontWeight: '700',
    lineHeight: 24,
  },
  skeletonTitleBar: {
    width: 160, // DESVIO: largura fixa de skeleton
    height: 24,
    borderRadius: SYSTEM_TOKENS.radius.md,
    marginBottom: SYSTEM_TOKENS.spacing.sm,
  },
  skeletonSubtitleBar: {
    width: 240, // DESVIO: largura fixa de skeleton
    height: 16,
    borderRadius: SYSTEM_TOKENS.radius.md,
  },
});
```

### Tabela de Verificação da Rodada 1

| Verificação | Passou? | Observação |
| :--- | :--- | :--- |
| **Cores, espaços e raios vieram de tokens** | **Parcialmente** | Utilizou corretamente a paleta semântica (`color.surface`, `color.surface-variant`, `color.on-surface`, `color.on-surface-variant`, `color.action`, `color.border`, `color.focus`), os raios `radius.md` / `radius.lg` e os espaços `space.sm`, `space.md`, `space.lg`. Porém, inventou dimensões estruturais (avatar 64×64 dp com raio 32 dp; altura de card 88 dp). |
| **Todos os estados dos componentes foram respeitados** | **Sim** | Implementou os 3 estados do padrão F10: `loading` (esqueleto animado com redução de movimento), `empty` (apresentação acolhedora e encorajadora conforme o Princípio 1) e `success` (métricas e atalhos disponíveis). |
| **Alvos de toque e contraste respeitados** | **Sim** | Atalhos navegáveis respeitaram `target.min-size` (48 dp). Contraste de texto rigorosamente respeitado: `on-surface` (17,17:1), `on-surface-variant` (4,79:1 no claro, 13,46:1 no escuro) e anel de foco visível com 2 dp de espessura e 2 dp de afastamento. |
| **A IA não inventou valores** | **Não** | A IA inventou tamanhos tipográficos intermediários inexistentes no tokenário (`fontSize: 18` e `fontSize: 20`), dimensões fixas de skeleton (`width: 160` e `240`), tamanho do avatar (`64×64` com raio `32`) e opacidade de clique (`opacity: 0.85`). |

---

## 3. Desvios e Correções na Documentação

Em estrita consonância com a diretriz *"quem erra é o texto, não a IA"*, analisamos a causa de cada invenção na documentação e efetuamos as seguintes correções pontuais no ODS:

| Desvio Identificado | Causa (o que faltava ou estava ambíguo) | Arquivo corrigido | Alteração realizada |
| :--- | :--- | :--- | :--- |
| **Invenção de `fontSize: 18` e `20`** em subtítulos de cards e chevrons | O ODS possui apenas `font.title` (24 px), `font.body` (16 px) e `font.label` (14 px). Faltava uma proibição explícita de tamanhos intermediários e orientação clara para usar `font.title` ou `font.body` com peso enfático (700 ou 600) para cabeçalhos secundários. | [03-fundamentos.md](03-fundamentos.md) e [05-padroes.md](05-padroes.md) | Incluída regra imperativa: *"Nunca invente tamanhos tipográficos intermediários (ex.: 18 px ou 20 px). Para subtítulos e cabeçalhos de cards, utilize `font.title` ou `font.body` com peso enfático (700 ou 600)."* |
| **Invenção de dimensões do avatar (64×64 dp, raio 32 dp)** | O fluxo F10 mencionava *"Cabeçalho de identificação do estudante"* sem definir as dimensões do selo visual circular ou referenciar um token existente. | [05-padroes.md](05-padroes.md) | Formalizada a ancoragem no alvo mínimo: *"Cabeçalho de identificação do estudante com selo circular baseado em `target.min-size` (48 × 48 dp com raio de 24 dp)..."* |
| **Invenção de larguras fixas de skeleton (160 px, 240 px)** | A documentação prescrevia o estado `Carregando` com esqueleto (*skeleton*), mas omitia diretrizes de dimensionamento responsivo para blocos de carga. | [03-fundamentos.md](03-fundamentos.md) e [05-padroes.md](05-padroes.md) | Adicionada diretriz: *"Para elementos de carregamento (esqueleto/skeleton), utilize larguras percentuais (ex.: 60%, 80%, 100%) e alturas alinhadas às alturas de linha tipográficas (`lineHeight`: 32 px para títulos, 24 px para corpo e 20 px para rótulos) com `radius.md`."* |
| **Invenção de opacidade de toque (`opacity: 0.85`)** | O ODS documentava apenas `button.opacity-disabled: 0.6`, deixando em aberto o valor numérico para o feedback de clique (*pressed*) em cards e atalhos. | [03-fundamentos.md](03-fundamentos.md) | Formalizado em Movimento: *"Para feedback tátil de toque em cards e listas (`pressed`), utilize variação de superfície (`color.surface-variant`) ou redução sutil de opacidade padronizada para 0.8."* |

As alterações acima foram consolidadas e registradas formalmente no [CHANGELOG.md](CHANGELOG.md) na versão `1.0.0`.

---

## 4. Rodada 2 (Após as Correções)

- **Ferramenta e modelo:** Nova sessão independente do subagente com **Gemini 2.5 Flash**, sem histórico da Rodada 1 e com contexto restrito à documentação atualizada do ODS.
- **Material entregue à IA:** Mesmos 11 arquivos de `design-system/`, agora incorporando as diretrizes explícitas de não-invenção tipográfica, skeletons responsivos, avatar de 48 dp e feedback de toque padronizado.
- **Prompt usado:** Idêntico ao da Rodada 1.

### Resultado da Rodada 2 (Trecho representativo dos estilos e componentes gerados)

```tsx
// Trechos extraídos do ProfileScreen.tsx gerado na Rodada 2:

// 1. Selo de avatar estritamente baseado no target.min-size (48 dp com raio 24 dp)
<View
  style={[
    styles.avatarSeal,
    {
      width: tokens.target.minSize, // 48 dp
      height: tokens.target.minSize, // 48 dp
      borderRadius: tokens.target.minSize / 2, // 24 dp (raio concêntrico)
      backgroundColor: colors.action,
      marginRight: spacing.md,
    },
  ]}
>
  <Text style={[tokens.typography.title, { color: colors.onAction }]}>
    {initialLetter}
  </Text>
</View>

// 2. Esqueletos com larguras percentuais e alturas correspondentes ao lineHeight dos tokens
<SkeletonBlock
  width="60%"
  height={32} // lineHeight de font.title (32 px)
  colors={colors}
  reduceMotion={reduceMotion}
/>
<SkeletonBlock
  width="40%"
  height={24} // lineHeight de font.body (24 px)
  colors={colors}
  reduceMotion={reduceMotion}
/>

// 3. Títulos secundários sem tamanhos inventados (uso de font.body com peso 700)
<Text
  style={[
    tokens.typography.body, // 16 px / lineHeight 24 px
    {
      color: colors.onSurface,
      fontWeight: '700', // Peso enfático para subtítulo conforme 03-fundamentos
    },
  ]}
>
  {title}
</Text>

// 4. Feedback de toque padronizado sem valores mágicos
style={({ pressed }) => [
  shortcutStyles.item,
  {
    backgroundColor: pressed ? colors.surfaceVariant : colors.surface,
    borderColor: colors.border,
    borderRadius: tokens.shape.radiusMd,
    minHeight: tokens.target.minSize, // 48 dp
    opacity: pressed ? 0.8 : 1, // Opacidade padronizada em 03-fundamentos
  },
]}
```

### Tabela de Verificação da Rodada 2

| Verificação | Passou? | Observação |
| :--- | :--- | :--- |
| **Cores, espaços e raios vieram de tokens** | **Sim** | 100% dos valores aplicados derivam dos tokens do ODS (`color.surface`, `color.surface-variant`, `color.on-surface`, `color.on-surface-variant`, `color.action`, `color.border`, `color.focus`, `space.sm`, `space.md`, `space.lg`, `space-4`, `radius.md`, `radius.lg`, `elevation.card`). |
| **Todos os estados dos componentes foram respeitados** | **Sim** | Estados `loading` (esqueletos proporcionais com controle de movimento reduzido), `empty` (mensagem acolhedora e encorajadora do Princípio 1 com métricas zeradas) e `success` (métricas em destaque e opções de estudo). |
| **Alvos de toque e contraste respeitados** | **Sim** | Todos os atalhos interativos atendem ao alvo mínimo de 48 dp (`target.minSize`), com anel de foco explícito (`focus.ringWidth: 2`, `focus.ringOffset: 2` em `color.focus`) e contrastes certificados pela WCAG AA. |
| **A IA não inventou valores** | **Sim** | Nenhum tamanho tipográfico, dimensão de avatar ou largura de skeleton foi inventado. O componente utilizou exclusivamente a hierarquia formal e as diretrizes de composição adicionadas na documentação. |

---

## 5. Conclusão da Avaliação

A execução do teste com IA comprovou a premissa de que a IA atua como um leitor estrito das especificações técnicas:
1. **As lacunas textuais geraram desvios na Rodada 1:** A ausência de regras sobre tamanhos intermediários e dimensionamento de skeletons induziu a IA a inventar valores arbitrários (18 px, 20 px, 64 px).
2. **A correção das especificações eliminou 100% dos desvios na Rodada 2:** Uma vez que as ambiguidades foram sanadas em `03-fundamentos.md` e `05-padroes.md`, o novo agente produziu uma interface completamente alinhada aos tokens e padrões de acessibilidade.
3. **Autossuficiência comprovada:** O Orbity Design System mostrou-se plenamente capaz de orientar a construção autônoma de telas complexas sem necessidade de intervenção humana externa.
