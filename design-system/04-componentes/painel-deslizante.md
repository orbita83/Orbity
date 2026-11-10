# Painel deslizante de foco (FocusBottomSheet)

**Origem:** Adaptado de Material 3 Standard Bottom Sheets para organizar foco e progresso sem retirar a navegação do estudante. A composição de F1/F2 está em [05-padroes.md](../05-padroes.md#2-navegação-e-modo-foco-f1-f2); os valores de cor estão em [02-tokens.md](../02-tokens.md#variante-cósmica).

## Uso e anatomia

- Use na Tela Inicial para foco, progresso e conquistas. O painel começa recolhido; toque no convite ou no planeta, gesto ou alça oferece acesso, conforme F1/F2.
- O painel usa gradiente `cosmicTokens.color.sheet` → `cosmicTokens.color.sheetEnd` e contorno `cosmicTokens.color.sheetBorder`. Cards usam `cosmicTokens.color.card` → `cosmicTokens.color.cardEnd` e `cosmicTokens.color.cardBorder`.
- Títulos usam `cosmicTokens.color.text`; textos auxiliares usam `cosmicTokens.color.muted`. O foco usa `cosmicTokens.color.focus`, com `focus.ring-width` e `focus.ring-offset`.
- O progresso usa `cosmicTokens.color.track` e gradiente `cosmicTokens.color.progress` → `cosmicTokens.color.progressEnd`, acompanhado de valor textual. A ação principal segue [botao.md](botao.md).
- Alça e controles possuem alvo mínimo de 48 × 48 dp. Desde a 1.2, a alça visual mede `size.handle-width` × `size.handle-height` (40 × 5 dp) na cor `sheet.handle` (`cosmicColors.inactive`), dentro de uma área de toque de 48 dp.
- Desde a 1.2, o painel usa cantos superiores `radius.sheet` (24 dp), fio superior `color.border-subtle` e sombra `shadow.sheet`, sem brilho colorido.
- O "Progresso de hoje" usa a [barra de progresso](barra-progresso.md) e conta tarefas e rotinas concluídas sobre o total do dia ("1 / 25"), não minutos de foco.
- Os cartões de conquista seguem [cartao-conquista.md](cartao-conquista.md), sem rótulo de dias abaixo das caixas.

## Estágios e estados

| Estado | Comportamento e aparência |
| --- | --- |
| Recolhido | Painel oculto, planeta e convite visíveis; navbar visível. |
| Intermediário (1.1) | Revela Modo Foco, Progresso de hoje e Conquistas; navbar visível. |
| Expandido (1.2) | Acrescenta Última sessão e Como funciona?; navbar visível. |
| Sessão de foco ativa | Exibe cronômetro e ação de encerramento; navbar oculta. |
| Carregando | Esqueletos em `cosmicTokens.color.card` e `cosmicTokens.color.track`; anuncie carregamento. |
| Vazio | Progresso zerado e mensagem acolhedora em `cosmicTokens.color.text` e `cosmicTokens.color.muted`. |
| Hover, pressionado, desabilitado | As cores não definidas dos controles permanecem lacunas. |
| Foco | Indicador `cosmicTokens.color.focus`, com geometria dos tokens de foco. |

Os estágios são posições do mesmo painel. A navbar é ocultada durante foco ativo ou seleção múltipla de tarefas conforme F6.

## Acessibilidade e interação

- Ofereça abertura e recolhimento por toque e teclado, além de swipe; exponha nome, papel e estado da alça.
- Distinga arrastar o painel de rolar o conteúdo e preserve uma saída clara. Não confine foco em painel não modal enquanto a navbar estiver disponível; diálogos modais seguem [06-acessibilidade.md](../06-acessibilidade.md).
- Exponha valor textual do progresso, permita texto ampliado e rolagem, respeite redução de movimento e não use cor como único indicador de estado.
- Anuncie `expanded` na alça, `busy` durante carregamento e papel de barra de progresso com valor textual; restaure o foco ao controle de origem quando apropriado.
- Mantenha escala de texto até 200%, com crescimento vertical e rolagem; reduza a transição a atualização instantânea ou curta quando o sistema solicitar movimento reduzido.
- Formulários de criação e confirmações de exclusão usam seus próprios padrões, não este painel.
- Calcule contraste no fundo efetivo, incluindo extremidades dos gradientes; a matriz completa permanece na #86.

## Implementação e lacunas

O painel ainda não está implementado nesta branch. A 1.2 definiu cor e dimensões da alça, raio, fio e sombra; estados visuais ausentes e regras de ancoragem não especificadas em F1/F2 ainda exigem definição. Não introduza valores arbitrários. O botão e a navbar aceitam o tema global sólido, mas isso não implementa o painel nem seus gradientes.
