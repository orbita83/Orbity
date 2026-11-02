# [UC-0014] - Explorar constelação

## 1. Identificação

| Campo | Descrição |
|---|---|
| **ID** | UC-0014 |
| **Nome** | Explorar constelação |
| **Ator principal** | Estudante |
| **Objetivo** | Visualizar e explorar o mapa estelar do Cosmos, inspecionando estrelas acesas e bloqueadas |

## 2. Contexto

Permite ao estudante acessar o módulo visual Cosmos na barra de navegação e explorar a constelação que representa sua evolução nos estudos. No mapa interativo, o estudante identifica estrelas acesas (conquistadas) e estrelas bloqueadas em contorno neutro, podendo tocar em qualquer estrela para consultar o modal de detalhes contendo o nome, curiosidades astronômicas ou o marco de sequência necessário para acendê-la.

## 3. Pré-condições

- O aplicativo deve estar em execução e a aba Cosmos acessível na barra de navegação.

## 4. Pós-condições

- O mapa visual da constelação deve exibir com precisão o estado atual das estrelas correspondente à sequência do estudante.
- Ao tocar em uma estrela, o modal de detalhes da estrela deve ser exibido com suas informações astronômicas e data de conquista ou o marco de sequência exigido.
- O estudante não deve regredir nem perder estrelas já acesas por eventuais pausas na sequência.

## 5. Fluxos relacionados

| ID | Fluxo | Especificação |
|---|---|---|
| FL-0014 | Exploração do mapa estelar Cosmos e detalhes de estrelas | [FL-0014](../flows/FL-0014.md) |
