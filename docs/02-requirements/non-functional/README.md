# Requisitos Não Funcionais — Orbity

Este diretório centraliza os requisitos não funcionais do Orbity, organizando suas especificações e facilitando a consulta, manutenção e rastreabilidade dos atributos de qualidade e das restrições do sistema durante o desenvolvimento.

Cada requisito possui um identificador único e uma especificação individual em Markdown, servindo como referência para a arquitetura, implementação, testes e validação contínua do aplicativo.

## 1. Organização

Os requisitos são organizados por categoria conforme a norma de qualidade de software ISO/IEC 25010, com seus respectivos arquivos de especificação.

| Categoria | Diretório | Identificação |
| --- | --- | --- |
| Requisitos Não Funcionais (RNF) | [`docs/02-requirements/non-functional/`](./) | `RNF-XXXX` |

## 2. Catálogo de Requisitos Não Funcionais

| ID | Requisito | Atributo de Qualidade | Descrição | Especificação |
| --- | --- | --- | --- | --- |
| RNF-0001 | Desempenho e eficiência de recursos | Eficiência de Desempenho | Garantir respostas visuais imediatas (< 200 ms) e transições fluidas sem sobrecarga de bateria ou memória. | [`docs/02-requirements/non-functional/RNF-0001.md`](./RNF-0001.md) |
| RNF-0002 | Usabilidade e experiência do estudante | Usabilidade | Proporcionar interface clara, estados vazios orientadores e comunicação acolhedora sem mensagens punitivas. | [`docs/02-requirements/non-functional/RNF-0002.md`](./RNF-0002.md) |
| RNF-0003 | Acessibilidade | Acessibilidade | Cumprir critérios da WCAG 2.1 AA (contraste ≥ 4,5:1, áreas de toque ≥ 48 dp e suporte a leitores de tela). | [`docs/02-requirements/non-functional/RNF-0003.md`](./RNF-0003.md) |
| RNF-0004 | Persistência local e disponibilidade | Confiabilidade / Disponibilidade | Garantir funcionamento offline-first e persistência íntegra de tarefas, rotinas e progresso no dispositivo. | [`docs/02-requirements/non-functional/RNF-0004.md`](./RNF-0004.md) |
| RNF-0005 | Confiabilidade e integridade de dados | Integridade / Tolerância a Falhas | Assegurar atomicidade em operações de escrita, preservação de dados em formulários e contenção de falhas. | [`docs/02-requirements/non-functional/RNF-0005.md`](./RNF-0005.md) |
| RNF-0006 | Compatibilidade e responsividade | Portabilidade / Compatibilidade | Assegurar execução consistente em Android 8.0+, iOS 14+ e navegadores web com layout adaptável. | [`docs/02-requirements/non-functional/RNF-0006.md`](./RNF-0006.md) |
| RNF-0007 | Segurança e privacidade dos dados | Segurança / Privacidade | Proteger dados locais do estudante na sandbox do dispositivo e impor comunicação criptografada (HTTPS/TLS). | [`docs/02-requirements/non-functional/RNF-0007.md`](./RNF-0007.md) |

## 3. Rastreabilidade

A rastreabilidade dos requisitos não funcionais é estabelecida por meio de seus identificadores únicos (`RNF-XXXX`) e das referências aos requisitos funcionais, às regras de negócio e aos demais artefatos do projeto.

Os identificadores podem ser utilizados em:

- Requisitos funcionais ([`docs/02-requirements/functional/`](../functional/));
- Regras de negócio ([`docs/02-requirements/business-rules/`](../business-rules/));
- Casos de uso e especificações técnicas ([`docs/04-specifications/`](../../04-specifications/));
- Decisões arquiteturais ([`docs/05-architecture/`](../../05-architecture/));
- Casos de teste ([`docs/06-quality/`](../../06-quality/));
- Issues e Pull Requests.

## 4. Manutenção

- Cada requisito possui um arquivo Markdown individual (`docs/02-requirements/non-functional/RNF-XXXX.md`).
- Os identificadores existentes são preservados durante as manutenções e nunca reutilizados para outros propósitos.
- Novos requisitos não funcionais devem ser adicionados ao catálogo com seus respectivos links e categorias.
- Alterações nos requisitos devem manter consistência entre contexto, detalhamento e critérios de aceite mensuráveis.
- Requisitos redundantes ou fora do escopo de software (como regras de negócio ou de governança de código) devem ser direcionados para suas respectivas pastas e documentos de origem.
