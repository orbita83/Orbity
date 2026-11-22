# Modal (Modal)

Origem no sistema base: Material 3, Dialog. Situação: Novo (1.2). Motivo: apresentar detalhes (como a conquista em F3) sobre a tela atual, com véu escuro e fechamento explícito por "✕".

Referências locais: [05-padroes.md](../05-padroes.md#6-conquistas-f3), [cartao-conquista.md](cartao-conquista.md) e [06-acessibilidade.md](../06-acessibilidade.md).

## Quando usar

- Use para o detalhe da conquista (1.4) e para confirmações curtas (exclusão individual ou em lote de tarefas, exclusão de rotina, descarte de alterações e futuras confirmações).

## Quando não usar

- Não use para formulários longos de criação; use tela própria.
- Não use para conteúdo que o estudante precise comparar com a tela de fundo.

## Anatomia

1. Véu: `color.scrim` (`rgba(3, 4, 23, 0.72)`) cobrindo a tela inteira.
2. Superfície: `color.surface-variant`, cantos `radius.sheet` (24 dp), fio `color.border-subtle`, sombra `shadow.modal`, padding `space.lg`.
3. Botão "✕" no canto superior, 48 × 48 dp, nome "Fechar".
4. Conteúdo: título `font.title`, descrição `font.body`; no detalhe da conquista, medalha de 120 dp com `radius.xl`.
5. Ações: `PrimaryButton` (ex.: "Compartilhar") no rodapé.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Detalhe | Conquista | Anatomia acima |
| Sucesso | Confirmação de criação ("Tarefa criada!") | Mesmos tokens; ícone `check` de `size.dialog-icon` em círculo com borda `color.success`; uma ação principal (`SuccessDialog.tsx`) |
| Seleção | Escolher data, horário ou categoria | Mesmos tokens; lista de opções em `radiogroup` ([seletor-opcoes.md](seletor-opcoes.md), `TaskPickerModal.tsx`) |
| Confirmação | Ação destrutiva (excluir tarefa individual ou em lote, excluir rotina) e confirmações reutilizáveis | Mesmos tokens; ícone central de `size.dialog-icon` (96 dp) em círculo com borda `color.error`; título e texto centralizados; ações empilhadas: a confirmação recebe destaque primário (`PrimaryButton`) e o cancelamento usa o estilo secundário com borda `cosmicBorders.sheet` e texto `color.on-surface` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Aberto | Véu e superfície | Foco vai para o título ou o "✕" | Papel de diálogo modal, título anunciado |
| Fechando | Desvanecimento em `motion.duration.short` | Fecha por "✕", `Escape`, gesto de voltar ou toque no véu | Foco volta ao elemento de origem |
| Hover, pressionado | Nos controles internos, conforme cada componente | — | — |
| Foco | Confinado ao modal | Tab circula dentro dele | WCAG 2.4.3 |
| Desabilitado | Não se aplica | — | — |

## Acessibilidade

- Confine o foco enquanto aberto e restaure-o ao fechar.
- Com movimento reduzido, abra e feche sem escala, apenas com opacidade curta ou instantânea.
- Texto sobre a superfície: `#FAF9FF` sobre `#141332` = 17,16:1.

## Faça e evite

- **Faça:** ofereça sempre o "✕" visível.
- **Evite:** brilho em volta da superfície; use `shadow.modal`.

## Código

A variante Confirmação está em [ConfirmDialog.tsx](../../src/view/components/ConfirmDialog.tsx) (`Modal` do React Native com `transparent`), com histórias em `FeedbackComponents.stories.tsx` para exclusão individual de tarefa, exclusão múltipla de tarefas e exclusão de rotina. O componente recebe título, mensagem, rótulos e callbacks configuráveis, permitindo reutilização em futuras telas sem duplicação. O botão de confirmação (`confirmLabel`) utiliza `PrimaryButton`, enquanto o cancelamento (`cancelLabel`), o ✕ e o voltar do Android acionam `onCancel`. A variante Detalhe da conquista ainda não está implementada.

```tsx
<ConfirmDialog
  visible={visible}
  icon="delete_outline"
  title="Excluir a rotina Matemática?"
  message="Ela sai da sua lista e não aparece mais nos próximos dias."
  cancelLabel="Manter rotina"
  confirmLabel="Excluir rotina"
  onCancel={closeDialog}
  onConfirm={deleteRoutine}
/>
```
