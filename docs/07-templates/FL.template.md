# [FL-XXXX] - Título do fluxo

## 1. Contexto

**Finalidade do fluxo:** [Descrever a finalidade do fluxo.]

**Objetivo do ator:** [Descrever o que o ator deseja alcançar.]

## 2. Fluxo principal

| Passo | Ator | Ação |
| ----- | ---- | ---- |
| 1 | [Ator] | [Descrever a ação inicial.] |
| 2 | [Ator ou sistema] | [Descrever a próxima ação.] |
| 3 | [Ator ou sistema] | [Descrever a próxima ação.] |

## 3. Fluxos alternativos

### 3a. [Título do fluxo alternativo]

**Ponto de desvio:** passo 3 do fluxo principal, quando [descrever a condição de desvio].

| Passo | Ator | Ação |
| ----- | ---- | ---- |
| 3a.1 | [Ator] | [Descrever a ação alternativa.] |
| 3a.2 | [Ator ou sistema] | [Descrever a próxima ação alternativa.] |

**Resultado:** [Informar se o fluxo retorna ao passo N do fluxo principal ou termina com sucesso.]

### 3b. [Título de outro fluxo alternativo]

**Ponto de desvio:** passo 3 do fluxo principal, quando [descrever outra condição de desvio].

| Passo | Ator | Ação |
| ----- | ---- | ---- |
| 3b.1 | [Ator] | [Descrever a ação alternativa.] |

**Resultado:** [Informar se o fluxo retorna ao passo N do fluxo principal ou termina com sucesso.]

Quando não houver fluxos alternativos, substituir esta seção por **Não se aplica**.

## 4. Fluxos de exceção

### 3c. [Título da exceção]

**Ponto de desvio:** passo 3 do fluxo principal, quando [descrever a condição de falha].

| Passo | Ator | Ação |
| ----- | ---- | ---- |
| 3c.1 | [Ator ou sistema] | [Descrever a falha detectada e o tratamento realizado.] |
| 3c.2 | [Ator ou sistema] | [Descrever o resultado do tratamento.] |

**Resultado:** [Após o tratamento da falha, informar se o fluxo retorna ao passo N indicado do fluxo principal ou é encerrado; em caso de encerramento, descrever o resultado.]

### 3d. [Título de outra exceção]

**Ponto de desvio:** passo 3 do fluxo principal, quando [descrever outra condição de falha].

| Passo | Ator | Ação |
| ----- | ---- | ---- |
| 3d.1 | [Ator ou sistema] | [Descrever a falha e seu tratamento.] |

**Resultado:** [Após o tratamento da falha, informar se o fluxo retorna ao passo N indicado do fluxo principal ou é encerrado; em caso de encerramento, descrever o resultado.]

Quando não houver fluxos de exceção, substituir esta seção por **Não se aplica**.

### Convenções de ramificação

- Cada fluxo alternativo ou de exceção deve compartilhar a referência numérica do passo principal em que ocorre o desvio.
- Utilize uma letra diferente para cada ramificação do mesmo passo, incluindo fluxos alternativos e de exceção.
- Numere sequencialmente os passos dentro de cada ramificação, utilizando o formato `3a.1`, `3a.2`, `3b.1` etc.
- Não reutilize letras para ramificações diferentes do mesmo passo. As letras podem ser reutilizadas em outro passo principal.
- Cada funcionalidade deve ser documentada em um único arquivo FL, incluindo seus fluxos principal, alternativos e de exceção. Não fragmente cenários em arquivos separados.
