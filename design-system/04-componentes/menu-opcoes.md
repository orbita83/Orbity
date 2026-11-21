# Menu de opções (OptionsMenu)

Origem no sistema base: [Menu do Material 3](https://m3.material.io/components/menus/overview), aberto por um botão de reticências ("•••"). Situação: Novo (1.3). Motivo: dar ações rápidas para **uma** tarefa sem entrar na seleção múltipla. Validado no protótipo do Claude Design, tela 2 · Lista de tarefas (21/11/2026).

## Quando usar

- Use no "•••" do [CardTarefa](card-tarefa.md) para agir sobre uma única tarefa: Editar, Fixar (ou Desafixar) e Excluir.
- Use quando as ações valem só para o item de onde o menu saiu.

## Quando não usar

- Não use para agir sobre várias tarefas de uma vez: isso é o toque longo, que abre a seleção múltipla (F6) com a [barra de ações contextuais](barra-acoes-contextuais.md).
- Não use para escolher um valor de formulário; para isso existe o [seletor de opções](seletor-opcoes.md).
- Não use para confirmar ações destrutivas: o menu só abre a confirmação do [modal](modal.md).

## Anatomia

1. **Gatilho:** o botão "•••" do card, com alvo de 48 dp (`target.min-size`), ícone em `cosmicTokens.color.inactive`, `aria-haspopup="menu"` e `aria-expanded`.
2. **Contêiner:** 200 dp de largura (o Material 3 aceita de 112 a 280), ancorado logo abaixo do "•••" e alinhado à direita do card. Fundo `color.surface-variant` (`#141332`), contorno `cosmicTokens.color.sheetBorder`, raio `radius.md` (12), sombra `shadow.bar-top` e espaço interno vertical de `space.sm` (8).
3. **Item:** altura mínima de 48 dp, espaço lateral de `space.md` (16) e espaço de 12 dp entre o ícone e o rótulo. Ícone de 24 dp em `color.on-surface-variant` e rótulo em `font.body` (16/24) em `color.on-surface`.
4. **Divisor:** linha de 1 dp em `color.border-subtle`, com `space.sm` acima e abaixo, separando a ação destrutiva das demais.
5. **Item destrutivo (Excluir):** fica por último. O ícone vai em `color.error`, e o rótulo continua em `color.on-surface`.

Ordem dos itens: **Editar**, **Fixar** (vira "Desafixar" quando a tarefa já está fixada), divisor e **Excluir**.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Fechado | Só o "•••" | Toque abre o menu | `aria-expanded="false"` |
| Aberto | Contêiner sobre o conteúdo; o card de origem fica acima de uma camada transparente | Toque fora, Voltar (Android) ou Esc (web) fecha sem agir | `aria-expanded="true"`; contêiner com papel de menu e o rótulo do "•••" |
| Item pressionado | `motion.scale-pressed` e `motion.opacity-pressed` | Executa a ação e fecha o menu | Item com papel de item de menu |
| Foco | Anel de foco padrão (`focus.ring-width`, `color.focus`) | Setas navegam entre itens; Enter ativa | O foco vai para o primeiro item ao abrir e volta ao "•••" ao fechar |

## Ações

- **Editar:** abre a edição da tarefa. A tela ainda não existe (lacuna já registrada no detalhe da tarefa, 2.4).
- **Fixar / Desafixar:** a tarefa fixada sobe para o topo da lista e mostra o `push_pin` de 16 dp em `color.on-surface-variant` no fim do card, logo antes do "•••", com o nome acessível "Fixada". O ícone não fica antes do título, para não empurrar o texto e manter os títulos alinhados entre cards fixados e não fixados.
- **Excluir:** abre a confirmação do [modal](modal.md) para uma tarefa: "Excluir tarefa?", com o título da tarefa no texto, "Excluir" (`PrimaryButton`) e "Manter tarefa" (secundário com contorno), como no `ConfirmDialog` (issue #151).

## Acessibilidade

- Todos os itens têm alvo de 48 dp ou mais.
- O tipo da ação aparece por ícone e texto, não só pela cor: o vermelho do Excluir reforça, mas o rótulo diz a ação.
- Contraste: rótulo `#FAF9FF` sobre `#141332` = 17,16:1; ícone `#BBB6E3` sobre `#141332`, acima de 3:1.

## Faça e evite

- **Faça:** use o menu para uma tarefa e o toque longo para várias.
- **Faça:** sempre peça confirmação antes de excluir.
- **Evite:** colocar no menu ações que valem para a lista inteira (Marcar todas, por exemplo).
- **Evite:** brilho ou cor de fundo no item destrutivo.

## Em aberto

- **Implementação:** hoje o "•••" do `TaskCard` (`onOptionsPress`) abre a seleção múltipla em `src/`. A troca pelo menu vem numa issue de implementação.
- **Rotinas:** se o menu também entra nos cards de Rotinas.
- **Largura:** se os 200 dp viram token (`menu.width`).

## Código

Ainda não implementado. Referência visual: protótipo do Claude Design, tela 2 · Lista de tarefas (toque no "•••").
