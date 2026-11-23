# Marca do Orbity

Arquivos-mestre da identidade visual. Nenhum deles entra no build: o ícone do app, o ícone adaptativo, o splash e os materiais da Google Play são **exportados** daqui para `assets/app/` e `store/google-play/`. Ao alterar o símbolo, altere o SVG e exporte de novo todos os derivados.

## Arquivos

| Arquivo | Conteúdo | Formato |
| :--- | :--- | :--- |
| `orbity-symbol.svg` | Símbolo colorido, fundo transparente | SVG, prancheta 1024×1024 |
| `orbity-symbol.png` | Exportação do SVG colorido | PNG 2048×2048 com transparência |
| `orbity-symbol-on-background.png` | Símbolo sobre `#030417`, como fica o ícone | PNG 2048×2048 opaco, sem cantos arredondados |
| `orbity-symbol-monochrome.svg` | Silhueta branca com a mesma geometria | SVG, prancheta 1024×1024 |
| `orbity-symbol-monochrome.png` | Exportação da silhueta | PNG 2048×2048 com transparência |
| `orbity-logo.png` | Símbolo com o nome "Orbity", usado no `README.md` da raiz | PNG |

## Geometria e restrições

- Esfera e anel centrados em (512, 512). O ponto mais distante do símbolo fica a 294 px do centro, dentro do círculo de 300 px de raio (600 px de diâmetro) exigido pela área segura do ícone adaptativo e do splash do Android 12+.
- Anel inclinado 25°, de baixo à esquerda para cima à direita. A parte de trás fica escondida pela esfera e a da frente passa sobre ela com uma folga transparente, que mantém o anel separado da esfera na silhueta monocromática.
- Sem texto visível, sem imagens raster embutidas, sem brilho externo, sombra ou moldura: o Android e a Google Play aplicam máscara e sombra. Os SVGs têm um `<title>Orbity</title>`, que não é desenhado: é o nome acessível lido por leitores de tela e navegadores.

## Cores

Todas vêm dos tokens do planeta (`planetColors` em `src/view/theme/tokens.ts`, variante cósmica de `design-system/02-tokens.md`):

| Uso | Token | Hex |
| :--- | :--- | :--- |
| Realce da esfera e da borda | `planet.highlight` | `#EBACFF` |
| Luz | `planet.light` | `#BD6AFF` |
| Superfície | `planet.surface` | `#8840E9` |
| Sombra | `planet.shadow` | `#39149A` |
| Face noturna | `planet.night` | `#17075B` |
| Anel | `planet.ring` | `#A95BFA` |
| Realce do anel | `planet.ringHighlight` | `#E8B5FF` |
| Borda inferior direita da esfera | `blue-600` | `#4F46E5` |
| Fundo do ícone | `cosmicTokens.color.background` | `#030417` |

**Exceção registrada:** a borda inferior direita usa o primitivo `blue-600`, fora da tabela da #194, para manter o contorno azulado da arte escolhida pela equipe. O contraste com `#030417` é de 3,23:1, acima do mínimo de 3:1 para gráficos não textuais (WCAG 1.4.11). As cores mais escuras (`#39149A`, `#17075B`) ficam só no interior da esfera, nunca na borda externa.

## Origem

- **Arte de referência:** gerada com o **Gemini**, plano **Pro**, modelo informado pelo operador como "Neon" no modo "high". A equipe escolheu a arte em 22/11/2026 na #194.
- **Referências de estilo enviadas ao Gemini:** o repositório do Orbity (com o ODS) e imagens de direcionamento criadas anteriormente pelo Codex, no plano Plus. Todas eram artes do próprio Orbity, sem ícones de outros apps.
- **Prompt final** (texto original enviado ao Gemini):

  > Faça uma analise meu repositorio para ter o contexto do projeto e a acesso ao ODS(orbity design system): github.com/Orbita83/Orbity
  > Criar a imagem main, descrita nas issues #194, #195, #196, #197, #198.
  > USE COMO EXEMPLO ESTAS: PRECISO DE DETALHES E CONSISTENCIA(passei imagens criadas pelo codex no plano plus como um direcionamento).

- **Termos de uso comercial:** **pendente.** A equipe precisa confirmar que os termos do Gemini (plano Pro) e do Codex (plano Plus) permitem o uso comercial das imagens geradas.
- **Ajustes manuais:** a imagem gerada (JPEG 1024×1024) não foi usada diretamente. O símbolo foi redesenhado em SVG geométrico (um círculo e duas elipses com gradientes e máscaras), mantendo a inclinação, as proporções e a folga entre anel e esfera da arte escolhida. Depois: redução para caber no círculo de 600 px, troca das cores pelos tokens acima e criação da silhueta monocromática com a mesma geometria.
- **Exportação:** PNGs gerados do SVG com o resvg (`@resvg/resvg-js`), em 23/11/2026.

Issue: #194. Acompanhamento: #198.
