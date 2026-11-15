# Aviso com ação (Snackbar)

Origem no sistema base: Material 3, Snackbar. Situação: Novo (1.2). Motivo: confirmar uma ação que acabou de acontecer e oferecer "Desfazer", sem interromper o estudante (protótipo 3.4, rotina excluída).

## Quando usar

- Use logo depois de uma ação que o estudante possa querer desfazer, como excluir uma rotina.

## Quando não usar

- Não use para erros que exigem decisão; use um [modal](modal.md) de confirmação.
- Não use para mensagens longas ou com mais de uma ação.

## Anatomia

1. Superfície: `color.surface-variant`, contorno de 1 dp `cosmicBorders.sheet`, cantos `radius.md`, sombra `shadow.modal`, altura mínima `target.min-size`.
2. Mensagem: `font.body-sm` em `color.on-surface`.
3. Ação opcional: texto `font.label` em `color.focus`, alvo de 48 × 48 dp.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Com ação | "Rotina excluída. Desfazer" | Anatomia acima |
| Só mensagem | Confirmação simples | Sem a ação |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | Conforme a anatomia | Aparece acima da navbar | Anunciado em região ao vivo educada |
| Hover | Não se aplica em toque | — | — |
| Pressionado | Ação com `motion.scale-pressed` e `motion.opacity-pressed` | Executa a ação | Mantém a área de 48 dp |
| Foco | Anel `color.focus` na ação | Teclado | Contraste ≥ 3:1 |
| Desabilitado | Não se aplica | — | — |

## Acessibilidade

- Contraste: `#FAF9FF` sobre `#141332` = 17,16:1; `#D4A3FF` sobre `#141332` acima de 4,5:1.
- O tempo na tela deve ser suficiente para ler e agir; quem usa o componente decide quando escondê-lo.

## Faça e evite

- **Faça:** ofereça "Desfazer" em ações destrutivas já confirmadas.
- **Evite:** empilhar vários avisos ao mesmo tempo.

## Código

Ainda não implementado. O posicionamento e o tempo de exibição ficam com a tela e a ViewModel.
