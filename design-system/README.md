# NOME-DO-SISTEMA · Sistema de design do app NOME-DO-APP

> Versão: 1.0.0 (rascunho) · Grupo: TODO: nomes dos integrantes · Disciplinas: IHC e PDM · IFPI Piripiri
>
> Como usar este kit: copie esta pasta para a raiz do repositório do trabalho final, apague os comentários `<!-- ... -->` e substitua todo `TODO:`. Nomes de arquivo e de seção não mudam.

## 1. Visão geral

TODO: em 2 ou 3 frases, diga o que é o app, quem usa e que sensação o sistema de design deve transmitir.

- **App:** TODO
- **Plataforma e stack:** TODO (ex.: Android com React Native + Expo; iOS com SwiftUI; Flutter)
- **Sistema base:** TODO (Material 3, Apple HIG ou Fluent 2)

## 2. Por que este sistema base (as cinco forças)

| Força | Justificativa em uma linha |
| --- | --- |
| Usuários | TODO: heurísticas e modelos mentais do público do app |
| Acessibilidade | TODO: o que o sistema base já garante e o que acrescentamos |
| Marca | TODO: identidade e personalidade do app |
| Plataforma | TODO: Android, iOS, Web ou Desktop |
| Tecnologia | TODO: como tokens e componentes viram código na nossa stack |

## 3. Inventário: telas × componentes

<!-- Etapa 1 da aula. Liste as telas do app e os componentes que cada uma usa. -->

| Tela | Componentes necessários |
| --- | --- |
| TODO: Login | TODO: campo de texto, botão |

## 4. Mapa dos arquivos

| Arquivo | Conteúdo |
| --- | --- |
| [01-principios.md](01-principios.md) | Valores que guiam as decisões |
| [02-tokens.md](02-tokens.md) | Tokens primitivos, semânticos e de componente |
| [03-fundamentos.md](03-fundamentos.md) | Regras de cor, tipografia, espaço, ícones, elevação e movimento |
| [04-componentes/](04-componentes/) | Um arquivo por componente |
| [05-padroes.md](05-padroes.md) | Fluxos: login, busca, formulário etc. |
| [06-acessibilidade.md](06-acessibilidade.md) | Contraste, alvos de toque, foco, leitor de tela |
| [07-teste-com-ia.md](07-teste-com-ia.md) | Validação do sistema com um assistente de IA |
| [CHANGELOG.md](CHANGELOG.md) | Versões e mudanças |

## 5. Etiquetas de origem

Cada token, componente e regra traz uma etiqueta:

- **Herdado:** veio do sistema base sem mudança (cite a diretriz ou o token de origem).
- **Adaptado:** veio do sistema base com mudança (explique o motivo).
- **Novo:** não existe no sistema base (explique por que o app precisa).

## 6. Glossário

<!-- Use sempre o mesmo nome para a mesma coisa. -->

| Termo | Significado |
| --- | --- |
| Token | Decisão de design com nome e valor (`color.action` → `#4F46E5`) |
| TODO | TODO |

## 7. Quem mantém

- **Modelo de governança:** TODO (centralizado, federado ou híbrido) e por quê.
- **Responsável por revisar mudanças:** TODO
- **Como propor uma mudança:** TODO (ex.: pull request que altera o arquivo e o `CHANGELOG.md`)

## 8. Uso de IA na redação

TODO: declare se IA foi usada para redigir ou revisar estes arquivos, e em quais.

## 9. Instruções para assistentes de IA

Ao gerar ou alterar interface neste projeto:

1. Leia `01-principios.md`, `02-tokens.md` e `03-fundamentos.md` antes de qualquer tela.
2. Use **somente tokens**. Nunca escreva cores, tamanhos ou raios literais no código.
3. Para cada componente, siga o arquivo correspondente em `04-componentes/`, incluindo todos os estados.
4. Respeite `06-acessibilidade.md`: contraste mínimo de 4,5:1, alvo de toque mínimo e foco visível.
5. Se faltar um token, componente ou regra, **pergunte ou registre a lacuna**. Não invente valores.
6. Ao final, liste os tokens e componentes que você usou.
