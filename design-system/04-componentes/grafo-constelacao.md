# Grafo de constelação (ConstellationGraph)

Origem no sistema base: nenhum componente equivalente no Material 3. Situação: Novo (1.3). Motivo: mostrar as estrelas do estudante como uma constelação em grafo, no estilo do grafo do Obsidian, conforme o RF-0017 (uma estrela a cada dia somado à sequência e uma a cada conquista), o RF-0018 (constelação em grafo, só com estrelas conquistadas) e o FL-0012 (tocar numa estrela mostra o nome e uma curiosidade). Validado no protótipo do Claude Design, tela 4 · Cosmos (21/11/2026).

## Quando usar

- Use na aba Cosmos (F9) para mostrar todas as estrelas que o estudante já ganhou.
- Use sempre junto da visualização em lista, que é a alternativa acessível ao grafo (ver Acessibilidade).

## Quando não usar

- Não use para mostrar estrelas bloqueadas, metas futuras ou posições reservadas: o RF-0018 (CA-05) proíbe.
- Não use como decoração em outras telas; o campo de estrelas da Tela Inicial é o `CosmicStarfield`.
- Não use para dados que não sejam estrelas (tarefas, rotinas ou sessões).

## Anatomia

1. **Área do grafo:** container com fundo `constellation.bg`, raio `radius.lg` e contorno `cosmicTokens.color.cardBorder`. Ocupa o espaço livre da tela, entre o seletor de visualização e a navbar.
2. **Estrela de sequência:** ponto redondo de `constellation.node-streak-size` (8 dp; 12 dp quando tem 4 ligações ou mais) em `constellation.node-streak`. Uma para cada dia somado à sequência.
3. **Estrela de conquista:** estrela de 4 pontas de `constellation.node-achievement-size` (24 dp) em `constellation.node-achievement`. Uma para cada conquista desbloqueada. A forma diferencia os dois tipos além da cor.
4. **Ligação:** linha de 1 dp (`border.width-thin`) em `constellation.edge`. Liga cada estrela de sequência à do dia anterior, algumas estrelas a dias próximos (para formar uma malha, e não uma linha reta), cada conquista ao dia em que foi ganha e as conquistas entre si.
5. **Ponte:** ligação tracejada (traço 4, espaço 4) em `constellation.edge-bridge`, entre a última estrela de uma sequência e a primeira da seguinte. Mostra que a pausa não apagou nada.
6. **Rótulo:** nome da estrela em `font.caption`, abaixo do ponto. Cor `color.on-surface-variant`; `color.on-surface` nas conquistas e na estrela selecionada.
7. **Legenda:** no canto superior esquerdo, "● Sequência" e "✦ Conquista" em `font.caption` e `color.on-surface-variant`.
8. **Controles de zoom:** coluna no canto superior direito com Aproximar, Afastar e Centralizar. Cada botão tem `constellation.control-size` (48 dp), fundo `cosmicTokens.color.sheet`, contorno `cosmicTokens.color.sheetBorder` e raio `radius.md`.
9. **Detalhe da estrela:** painel no rodapé da área do grafo, com fundo `cosmicTokens.color.sheet`, contorno `cosmicTokens.color.sheetBorder`, raio `radius.lg` e `shadow.bar-top`. Mostra o ícone do tipo num quadro de 40 dp com fundo `color.action-subtle`, o nome (`font.card-title`), a origem e a data (`font.body-sm`, `color.on-surface-variant`), a curiosidade (`font.body-sm`, `color.on-surface`) e o botão "✕" de 48 dp.
10. **Dica inicial:** sem seleção, "Toque numa estrela · arraste para explorar" em `font.caption` e `cosmicTokens.color.inactive`, no canto inferior esquerdo.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Constelação (grafo) | Visualização padrão da aba Cosmos | `constellation.*`, `font.caption` |
| Lista | Alternativa acessível: as mesmas estrelas em cards, da mais nova para a mais antiga, com nome, origem e data | Card de 64 dp de altura mínima com `cosmicGradients.card`, `cosmicTokens.color.cardBorder`, `radius.lg`, `font.card-title`, `font.body-sm` |

O seletor entre as duas usa o padrão de [chips-filtro.md](chips-filtro.md) (grupo de rádio em colunas iguais), com as opções "Constelação" e "Lista".

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Estrelas e ligações nas cores base; rótulos só nas conquistas | Grafo parado depois de se acomodar | Área com papel de grupo e rótulo "Constelação: grafo com as suas estrelas" |
| Selecionada | Estrela em `constellation.node-selected` com anel de `focus.ring-width` em `color.action`; ligações dela em `constellation.edge-active` (2 dp); rótulos dela e das vizinhas visíveis | Abre o detalhe da estrela | Estrela anuncia `{ selected: true }`; detalhe com papel de diálogo e o nome da estrela |
| Vizinha | Cor normal, rótulo visível | Continua tocável | — |
| Esmaecida | Estrelas e ligações sem relação com a selecionada em `constellation.dim-opacity` (0,2) | Continua tocável | Não muda o nome acessível |
| Arrastando estrela | A estrela segue o dedo; as vizinhas são puxadas pela simulação de forças | Ao soltar, o grafo se reacomoda sozinho | — |
| Arrastando fundo | O grafo inteiro se move | Toque sem arrasto limpa a seleção | — |
| Hover (web) | Anel de `focus.ring-width` em `color.focus` ao redor do ponto | — | — |
| Foco | Anel de foco padrão (`focus.ring-width`, `focus.ring-offset`, `color.focus`) | Enter ou espaço seleciona | Ordem de foco segue a ordem das estrelas |
| Vazio | Uma única estrela, a do primeiro dia de sequência, e a dica inicial | — | Mesmo rótulo da área |

## Comportamento

- **Física:** simulação de forças simples. Todas as estrelas se repelem, as ligações agem como molas e uma leve atração mantém o conjunto no centro. O grafo se acomoda uma vez ao abrir e volta a se mexer quando uma estrela é arrastada.
- **Tamanho e posição:** o desenho se encaixa na área visível uma única vez, ao abrir. Depois, o zoom vai de 0,6× a 2,6×, de 1,25 em 1,25. Com zoom de 1,5× ou mais, todos os rótulos aparecem.
- **Movimento reduzido:** com a preferência do sistema ligada, o grafo se acomoda de uma vez, sem animação, e as transições de opacidade e de zoom ficam instantâneas.
- **Transições:** opacidade e cor em `motion.duration.short` a `motion.duration.medium`, com `motion.easing.standard`.
- **Sem regressão:** estrelas nunca somem nem apagam. Uma pausa na sequência vira ponte, não buraco (`01-principios.md`).
- **Sem brilho:** destaque só por cor sólida, anel e opacidade (regra da 1.2).

## Acessibilidade

- **Alvos de toque (exceção documentada):** as estrelas têm área de toque de 28 dp (sequência) e 40 dp (conquista), abaixo dos 48 dp de `target.min-size`, porque um grafo denso com alvos de 48 dp ficaria sobreposto. A exceção vale **só** para as estrelas e é compensada pela visualização em Lista, em que cada estrela é um card com alvo de 48 dp ou mais, e pelo zoom. Todos os outros controles (zoom, "✕", seletor) seguem os 48 dp.
- **Além da cor:** o tipo da estrela aparece pela forma (ponto ou estrela de 4 pontas), pela legenda e pelo texto da origem. A seleção aparece pelo anel, pela linha mais grossa e pelo esmaecimento do resto.
- **Contraste** (sobre `color.surface` cósmico `#030417`):
  - Estrela de sequência `#BBB6E3`: 10,56:1.
  - Estrela de conquista `#D4A3FF`: 10,14:1.
  - Estrela selecionada `#FAF9FF`: 19,41:1, com anel `#7137F5` (5,62:1 contra o branco e 3,45:1 contra o fundo).
  - Ligação ativa `#7137F5`: 3,45:1.
  - As ligações comuns (`#2B2B3C` composto, 1,46:1) e a ponte (`#484958` composto, 2,29:1) são decorativas: as relações entre estrelas também aparecem no texto da origem e na Lista, por isso não precisam dos 3:1 de objeto gráfico.
  - O esmaecido (0,2) fica em cerca de 1,4:1 de propósito, para tirar o foco. A estrela esmaecida continua tocável e anunciada.
- **Leitor de tela:** cada estrela anuncia nome, tipo, origem e data (ex.: "Shaula, estrela de sequência, 12º dia, 17/11/2026") e o estado de seleção. O detalhe tem papel de diálogo, nome da estrela como título e "✕" com o rótulo "Fechar detalhes da estrela".
- **Teclado (web):** as estrelas recebem foco na ordem em que foram ganhas; Enter ou espaço seleciona; o "✕" fecha o detalhe.

## Faça e evite

- **Faça:** sempre ofereça a Lista ao lado do grafo.
- **Faça:** use curiosidades astronômicas verificadas, curtas e sem tom de cobrança.
- **Evite:** estrelas bloqueadas, contornos de "a desbloquear" ou contagem regressiva.
- **Evite:** brilho, halos ou desfoque nas estrelas; o único brilho permitido no app é `shadow.glow-planet`.
- **Evite:** ligar estrelas por critérios que o estudante não consiga entender pelo texto da origem.

## Em aberto

- **Regra das estrelas:** como cada estrela é gerada e nomeada (lista de nomes, ordem, curiosidades) depende da decisão de produto sobre a lógica das estrelas, ainda em estudo pelo operador.
- **Cor da estrela de conquista:** o protótipo usa `#D4A3FF`, o mesmo valor de `color.focus`. Avaliar trocar por `cosmicColors.unlocked` (`#C47EFF`), que já é a cor das conquistas desbloqueadas, para não misturar com o anel de foco.
- **Implementação:** o componente ainda não existe em `src/`; os tokens `constellation.*` também ainda não estão em `tokens.ts`.

## Código

Ainda não implementado. Referência visual: protótipo do Claude Design, tela 4 · Cosmos (constelação).
