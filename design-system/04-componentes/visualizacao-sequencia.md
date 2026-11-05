# Visualização de sequência (PlanetStreakView)

**Origem:** Novo; sem equivalente direto adotado do Material 3. O planeta representa a trajetória do estudante sem penalizar interrupções. O padrão da Tela Inicial está em [05-padroes.md](../05-padroes.md#2-navegação-e-modo-foco-f1-f2).

## Variante cósmica da Tela Inicial

- O fundo usa `cosmicTokens.color.background`. A esfera usa `cosmicTokens.planet.surface`, `light`, `highlight`, `relief`, `shadow`, `night` e `border`; o anel usa `ring` e `ringHighlight`, e o brilho decorativo usa `glow`. Os nomes abreviados pertencem a `cosmicTokens.planet`; valores em [02-tokens.md](../02-tokens.md#variante-cósmica).
- O contador e seu rótulo são texto real em `cosmicTokens.color.text`, escaláveis e sem truncamento. A ilustração é independente do contador.
- Quando acionável, mantenha alvo mínimo de 48 × 48 dp, nome acessível e anel `cosmicTokens.color.focus` com os tokens de geometria de foco.
- No estado recolhido, centralize a sequência; o deslocamento com o painel segue F1/F2. O protótipo especificado não demonstra evolução por ponto nem rotação axial.

## Estados e acessibilidade

| Estado | Tratamento |
| --- | --- |
| Padrão | Mostre contagem e rótulo textuais sobre a ilustração. |
| Pausa na sequência | Preserve conquistas e use linguagem acolhedora, sem cor de erro ou regressão punitiva. |
| Foco de teclado | Mostre `cosmicTokens.color.focus` quando acionável. |
| Hover e pressionado | Cores ainda não especificadas; não infira valores. |
| Movimento reduzido | Preserve a informação em texto sem depender de movimento decorativo. |

Oculte camadas decorativas do leitor de tela e exponha contagem e ação por nome acessível. Permita quebra de linha e crescimento vertical do texto sem truncamento. Não use efeitos que pisquem mais de três vezes por segundo. Verifique contraste do texto sobre todas as áreas da ilustração que possam ficar atrás dele; a matriz completa pertence à #86.

## Especificações futuras e implementação

A evolução visual por ponto e a rotação axial durante o foco são propostas futuras: faltam limiares, mapeamento de cada estágio e duração do ciclo. Quando definidas, devem preservar conquistas após pausas e desativar rotação com movimento reduzido. Não as apresente como comportamento existente. O visualizador não está implementado nesta branch; as cores globais cósmicas estão disponíveis no tema compartilhado.
