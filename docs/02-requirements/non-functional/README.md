# Requisitos Não Funcionais — Orbity

Este diretório centraliza os requisitos não funcionais do Orbity, organizando suas especificações e facilitando a consulta, manutenção e rastreabilidade dos atributos de qualidade e das restrições do sistema durante o desenvolvimento.

Cada requisito possui um identificador único e uma especificação individual em Markdown, permitindo sua utilização como referência para implementação, testes, validação e outros artefatos de engenharia de software.

## 1. Organização

Os requisitos são organizados por categoria, com seus respectivos arquivos de especificação.

| Categoria | Diretório | Identificação |
| --- | --- | --- |
| Requisitos Não Funcionais (RNF) | [`non-functional/`](./) | `RNF-XXXX` |

Os requisitos não funcionais devem seguir o modelo definido no template de RNF estabelecido pelo projeto.

## 2. Catálogo de Requisitos Não Funcionais

| ID | Requisito | Descrição |
| --- | --- | --- |
| [RNF-0001](./RNF-0001.md) | Usabilidade | Estabelecer condições para que o usuário utilize as funcionalidades do sistema de forma compreensível. |
| [RNF-0002](./RNF-0002.md) | Desempenho | Definir condições para que as operações do sistema sejam executadas em tempo adequado. |
| [RNF-0003](./RNF-0003.md) | Segurança e privacidade | Estabelecer condições para proteger os dados e impedir acessos ou alterações indevidos. |
| [RNF-0004](./RNF-0004.md) | Responsividade da interface | Definir condições para adaptação da interface aos diferentes tamanhos de tela suportados. |
| [RNF-0005](./RNF-0005.md) | Acessibilidade | Estabelecer condições para tornar os controles e as informações acessíveis aos usuários. |
| [RNF-0006](./RNF-0006.md) | Confiabilidade das operações | Definir condições para que as operações sejam executadas de maneira previsível e consistente. |
| [RNF-0007](./RNF-0007.md) | Integridade dos dados | Estabelecer condições para preservar a validade e a coerência dos dados cadastrados. |
| [RNF-0008](./RNF-0008.md) | Precisão temporal | Definir condições para o tratamento consistente de datas, horários e dias de atividade. |
| [RNF-0009](./RNF-0009.md) | Consistência dos registros de atividade e recompensas | Estabelecer condições para manter coerentes os registros diários, as sequências e as estrelas concedidas. |
| [RNF-0010](./RNF-0010.md) | Compatibilidade | Definir condições para o funcionamento do sistema nos ambientes oficialmente suportados. |
| [RNF-0011](./RNF-0011.md) | Manutenibilidade | Estabelecer condições para facilitar a compreensão, correção e manutenção do código. |
| [RNF-0012](./RNF-0012.md) | Testabilidade | Definir condições para verificar o comportamento do sistema por meio de testes. |
| [RNF-0013](./RNF-0013.md) | Tratamento de erros | Estabelecer condições para tratar falhas e apresentar informações compreensíveis ao usuário. |
| [RNF-0014](./RNF-0014.md) | Persistência dos dados | Definir condições para manter os dados salvos disponíveis conforme o comportamento esperado do sistema. |
| [RNF-0015](./RNF-0015.md) | Eficiência no uso de recursos | Estabelecer condições para evitar processamento e operações desnecessárias. |
| [RNF-0016](./RNF-0016.md) | Clareza das mensagens | Definir condições para apresentar mensagens objetivas e consistentes durante a utilização do sistema. |
| [RNF-0017](./RNF-0017.md) | Rastreabilidade das regras de sequência e estrelas | Estabelecer condições para documentar e verificar as regras de cálculo da sequência e concessão de recompensas. |
| [RNF-0018](./RNF-0018.md) | Capacidade de evolução | Definir condições para permitir a evolução do sistema com impacto controlado nas funcionalidades existentes. |

## 3. Rastreabilidade

A rastreabilidade dos requisitos não funcionais é estabelecida por meio de seus identificadores únicos (`RNF-XXXX`) e das referências aos requisitos funcionais e aos demais artefatos do projeto.

Os identificadores podem ser utilizados em:

- Requisitos funcionais;
- Issues e Pull Requests;
- Casos de uso;
- Regras de negócio;
- Casos de teste;
- Especificações técnicas;
- Outros artefatos de engenharia de software.

Cada RNF deve indicar os requisitos funcionais relacionados sempre que houver uma relação identificável entre eles.

## 4. Manutenção

- Cada requisito deve possuir um arquivo Markdown individual.
- Os identificadores existentes devem ser preservados durante alterações.
- Novos requisitos devem ser adicionados ao catálogo com seus respectivos links.
- Requisitos descontinuados não devem ter seus identificadores reutilizados.
- As especificações devem seguir o template de RNF estabelecido pelo projeto.
- Alterações nos requisitos devem manter a consistência entre suas descrições, critérios de aceitação e referências.
- Requisitos redundantes ou desatualizados devem ser revisados antes da aprovação de alterações.

## 5. Ciclo de vida dos requisitos

Os requisitos não funcionais do Orbity são definidos e refinados progressivamente, servindo como referência para estabelecer, implementar e validar os atributos de qualidade e as restrições do sistema.

O processo compreende as seguintes etapas:

1. **Identificação:** levantamento dos atributos de qualidade e das restrições relevantes para o sistema.
2. **Especificação:** documentação do requisito utilizando o template correspondente.
3. **Revisão:** análise da clareza, consistência, viabilidade e verificabilidade do requisito.
4. **Implementação:** adoção das medidas técnicas necessárias para atender ao requisito aprovado.
5. **Validação:** verificação do atendimento ao requisito por meio de critérios de aceitação, inspeções e testes aplicáveis.

Alterações nos requisitos devem ser refletidas em suas especificações e no catálogo, preservando a rastreabilidade com os requisitos funcionais e os demais artefatos do projeto.