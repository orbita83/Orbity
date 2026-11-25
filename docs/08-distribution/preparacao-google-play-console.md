# Preparação administrativa do Google Play Console

> Origem: [#177](https://github.com/orbita83/Orbity/issues/177). Registro iniciado em 24/11/2026.

## 1. Estado da execução

**Entrega parcial; cadastro do aplicativo adiado pelo operador.** Base documental: commit `61daeb136d64c970236cc85354a7c092c1757582` da `development`. Este registro acompanha execução e evidências; as decisões administrativas permanecem exclusivamente em [identidade e propriedade](./identidade-e-propriedade.md).

A #177 relata conta pessoal. A imagem apresentada pelo operador em 24/11/2026 mostra a notificação de identidade verificada em 19 de novembro. Em 25/11/2026, o titular confirmou diretamente a conclusão da verificação do dispositivo Android; não foi apresentada imagem do resultado dessa etapa. Data de criação da conta e acesso à produção continuam sem confirmação. As imagens apresentadas mostram que não há aplicativo cadastrado; em 25/11/2026, o operador decidiu adiar a criação enquanto resolve outras atividades do projeto. Não houve inspeção autenticada do Console nesta atividade. Nenhum cadastro, convite, declaração, envio ou publicação é apresentado como concluído.

Este trabalho termina na preparação administrativa. Não criar versões, enviar APK/AAB, iniciar testes distribuídos, solicitar acesso à produção ou publicar. O procedimento futuro de submissão continua em [submissao-google-play.md](./submissao-google-play.md), sem duplicação aqui.

## 2. Execução com o titular

| Etapa | Ação e evidência esperada | Situação atualizada em 25/11/2026 | Responsável pela próxima ação |
| --- | --- | --- | --- |
| Titularidade | Revisar a proposta da Seção 5.4 do documento de identidade; registrar aprovação do PR antes de substituir decisões vigentes | Titularidade confirmada diretamente pelo operador; atualização documental aguardando revisão | Equipe Orbity |
| Aprovação de releases/submissões | Confirmar separadamente quem exerce o papel; registrar eventual mudança por revisão | @Cassiosampaio2016 confirmou que assumiu a aprovação; atualização documental aguardando revisão | Equipe Orbity |
| Identidade | Conferir status e data no Console; registrar referência sanitizada da notificação | Notificação de identidade verificada em 19 de novembro visível na imagem apresentada em 24/11/2026 | Titular informado na #177 |
| Conta | Conferir tipo, data de criação e restrições na conta; registrar resumo sem dados pessoais | Tipo pessoal relatado; data e restrições desconhecidas | Titular informado na #177 |
| Dispositivo | Registrar a confirmação do titular e complementar com referência sanitizada do resultado para revisão | Conclusão confirmada pelo titular em 25/11/2026; sem imagem do resultado | Titular informado na #177 |
| Cadastro inicial | Conferir identidade aprovada, decisões da Seção 3 e declarações exibidas antes de criar; registrar nome, status e data | Não cadastrado nas imagens; criação adiada pelo operador em 25/11/2026 | Titular e equipe |
| Acessos | Definir integrantes, tarefas, permissões por app e validade; seguir solicitação da Seção 8.1 do documento de identidade e convite oficial | Sem lista aprovada; nenhum convite enviado | Titular e equipe |
| Ficha | Revisar materiais da Seção 3 e preencher somente informações confirmadas | Preparação pendente | Equipe Orbity |
| Privacidade | Conferir URL pública e conteúdo revisado da #176 antes de vincular | Depende da #176 | Equipe Orbity |
| Conteúdo e dados | Basear cada resposta no inventário e nas conclusões da #79, incluindo SDKs | Inventário parcial; não preencher respostas por suposição | Equipe, com apoio de @MailsonSousa88 |
| Testes e produção | Conferir requisitos segundo data/tipo da conta e registrar situação exibida; apenas identificar próximos passos | Elegibilidade não comprovada | Titular informado na #177 |

A verificação de dispositivo requer ação do titular em aparelho físico compatível; a fonte oficial indica Android 10 ou superior, sem root. A verificação de identidade não substitui essa etapa.

Na criação do aplicativo, revisar nome, pacote quando solicitado, idioma, tipo app/jogo, gratuito/pago, contato e declarações apresentadas. Usar apenas identidade já aprovada no documento central. Idioma, preço e contato público devem ser confirmados pela equipe; não derivar contato de dados pessoais do titular. Distinguir campos salvos de campos indisponíveis ou dependentes do primeiro artefato, sem enviar um build para desbloqueá-los nesta tarefa.

## 3. Materiais e declarações a revisar

| Item | Preparação necessária | Dependência para concluir |
| --- | --- | --- |
| Idioma, categoria e contato | Confirmar idioma principal, categoria, e-mail de suporte autorizado e responsável pelo atendimento | Decisão da equipe |
| Nome e descrições | Usar nome aprovado; redigir descrições restritas às funcionalidades disponíveis no commit de referência | Revisão do produto |
| Ícone, imagens e capturas | Conferir especificações vigentes da ficha; capturar a versão real, sem dados pessoais ou promessas de recursos futuros | Materiais e revisão visual da equipe |
| Política de privacidade | Conferir acesso público, conteúdo e versão; registrar URL e data da verificação | #176 |
| Segurança dos dados | Revisar coleta, compartilhamento, SDKs, proteção, retenção e exclusão; manter rastreabilidade das respostas | Inventário da #79 |
| Classificação e público-alvo | Responder questionários com base no conteúdo e público decididos; avaliar requisitos de crianças/famílias quando aplicáveis | Equipe e #79 |
| Anúncios, acesso do revisor e permissões | Conferir comportamento real e manifesto; justificar respostas e requisitos específicos | #79 e artefato pertinente da #78 |

Ainda não existem materiais ou respostas aprovados neste registro. Campos que o Console não disponibilizar devem ser registrados como indisponíveis, com motivo e próxima ação; não como atendidos.

## 4. Testes e acesso à produção

A fonte oficial consultada em 24/11/2026 informa que contas pessoais criadas após 13/11/2023 precisam de teste fechado com pelo menos 12 testadores inscritos continuamente por 14 dias antes de solicitar acesso à produção. Não aplicar nem dispensar o requisito sem confirmar a data da conta e as condições exibidas no Console. Cumprir o teste não equivale a aprovação automática do acesso.

Esta tarefa apenas registra o enquadramento e os próximos passos. Executar o teste, convidar testadores ou solicitar produção permanece fora de seu escopo.

## 5. Evidências e retorno à auditoria

Para cada etapa executada, registrar: identificador da evidência, data, executor por usuário GitHub, tela/escopo, resultado, referência sanitizada recuperável pelos autorizados, pendência, próxima ação e responsável. Não armazenar documentos pessoais, credenciais, dados financeiros, contatos privados ou nomes de testadores neste repositório.

| Evidência | Data | Escopo e resultado | Limite |
| --- | --- | --- | --- |
| P177-01 | 24/11/2026 | Consulta da #177: titularidade e identidade verificada relatadas; titularidade e aprovação de releases/submissões confirmadas diretamente pelo operador nesta data e registradas na Seção 5.4 do documento central | Relato da issue e confirmação direta do operador; sem inspeção autenticada e aguardando revisão do PR |
| P177-02 | 24/11/2026 | Fontes oficiais abaixo consultadas para preparar cadastro, dispositivo e enquadramento de testes | Requisitos documentais; não comprovam cumprimento pela conta |
| P177-03 | 24/11/2026 | Imagem do Console apresentada nesta conversa mostra conta pessoal, ausência de apps cadastrados e notificação de identidade verificada em 19 de novembro | Evidência visual limitada às telas apresentadas; não comprova dispositivo ou acesso à produção |
| P177-04 | 25/11/2026 | Titular confirmou diretamente nesta conversa que a verificação Android do dispositivo foi concluída | Confirmação do titular; sem imagem do resultado ou inspeção autenticada independente |

Fornecer à [auditoria da #79](./auditoria-google-play.md) os resultados de GP11, GP18–GP19 e GP22–GP31 à medida que houver evidências. Até lá, os estados pendentes permanecem; a existência deste registro não conclui cadastro nem conformidade. A revisão documental ocorre por PR para `development` conforme `CONTRIBUTING.md`.

## 6. Fontes e procedimento relacionado

Fontes oficiais consultadas em 24/11/2026; reconsultar durante a execução:

- [Criar e configurar o aplicativo](https://support.google.com/googleplay/android-developer/answer/9859152).
- [Verificação de dispositivo](https://support.google.com/googleplay/android-developer/answer/14316361).
- [Testes de contas pessoais novas](https://support.google.com/googleplay/android-developer/answer/14151465).
- [Guia de submissão da #81](./submissao-google-play.md): consultar para preparação futura, sem executar envio nesta tarefa.
