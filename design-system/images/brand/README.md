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
| `orbity-logo.svg` | Logotipo horizontal: símbolo e nome "Orbity", com as letras em contornos | SVG 984×242 |
| `orbity-logo-monochrome.svg` | Logotipo com a mesma geometria, todo em `#FFFFFF` | SVG 984×242 |
| `orbity-logo.png` | Exportação do `orbity-logo.svg`, usada no `README.md` da raiz | PNG 1968×484 com transparência |
| `orbity-logo-slogan.svg` | Lockup: logotipo com o slogan "Organize seus estudos no seu ritmo" embaixo, tudo em contornos | SVG 1081×355 |
| `orbity-logo-slogan-monochrome.svg` | Lockup com a mesma geometria, todo em `#FFFFFF` | SVG 1081×355 |
| `orbity-logo-slogan.png` | Exportação do `orbity-logo-slogan.svg`, para referência rápida | PNG 2162×710 (2x) com transparência |

**Par SVG + PNG:** os mestres principais (`orbity-symbol`, `orbity-logo` e o lockup `orbity-logo-slogan`) têm o SVG editável e um PNG de referência, com 2048 px no lado maior ou o dobro do SVG. As variantes (monocromáticas e sobre fundo) não precisam do par: basta o formato em que são usadas.

O banner `design-system/images/assets/orbity-design-system.png` (usado no `design-system/README.md`) é gerado a partir do `orbity-logo.svg`, e o gráfico de destaque da Google Play (`store/google-play/feature-graphic/`), a partir do `orbity-logo-slogan.svg`. Ao alterar o símbolo ou o logotipo, gere de novo os lockups e exporte de novo o `orbity-logo.png`, o `orbity-logo-slogan.png`, o banner e o gráfico de destaque.

## Geometria e restrições

- Esfera e anel centrados em (512, 512). O ponto mais distante do símbolo fica a 294 px do centro, dentro do círculo de 300 px de raio (600 px de diâmetro) exigido pela área segura do ícone adaptativo e do splash do Android 12+.
- Anel inclinado 25°, de baixo à esquerda para cima à direita. A parte de trás fica escondida pela esfera e a da frente passa sobre ela com uma folga transparente, que mantém o anel separado da esfera na silhueta monocromática.
- Sem texto visível, sem imagens raster embutidas, sem brilho externo, sombra ou moldura: o Android e a Google Play aplicam máscara e sombra. Os SVGs têm um `<title>Orbity</title>`, que não é desenhado: é o nome acessível lido por leitores de tela e navegadores.

## Logotipo

O logotipo junta o símbolo, sem alterações, ao nome "Orbity" à direita. As medidas abaixo estão nas unidades do SVG, em que o logotipo tem 242 de altura:

- **Construção das letras:** sem serifa, geométricas e arredondadas, desenhadas com formas simples (círculos, retângulos e curvas) e unidas num contorno (`<path>`) por letra. Não há `<text>` nem dependência de fonte instalada: o SVG abre igual em qualquer máquina.
- **Métricas:** linha de base em 177, altura-x de 106, ascendentes ("b" e "t") de 145 e descendente do "y" até 218. Todas as hastes têm 33 de espessura. O "O" e o bojo do "b" passam 3 unidades da linha de base e da altura, para parecerem do mesmo tamanho das letras retas.
- **Detalhes da identidade:** o pingo do "i" é um círculo de cor própria, o "t" tem o topo cortado na diagonal e o pé curvo, e o "y" termina numa cauda curva para a esquerda.
- **Alinhamento:** o símbolo ocupa 360 de largura e fica centralizado na vertical com o nome (do topo do pingo do "i" ao fim da cauda do "y").
- **Área de proteção:** deixe livre em volta do logotipo, no mínimo, a altura-x do nome (106 unidades, cerca de 44% da altura do logotipo). Nenhum texto, borda ou imagem entra nessa área.
- **Tamanho mínimo:** 120 px de largura na tela. Abaixo disso, use só o símbolo.
- **Fundo:** a versão colorida foi feita para fundos escuros (`#030417` ou o banner). Em fundo claro, use o `orbity-logo-monochrome.svg` recolorido para `#030417`, ou só o símbolo.

## Lockup com slogan

O `orbity-logo-slogan.svg` junta o logotipo, sem alterações, ao slogan "Organize seus estudos no seu ritmo", centralizado embaixo. Ele é usado no gráfico de destaque da Google Play (#197) e serve de base para o splash com logo e slogan do onboarding (F0, #147). As medidas estão nas unidades do logotipo (242 de altura):

- **Letras:** fonte **Outfit SemiBold** (peso 600), versão 1.100, convertida em contornos (`<path>`) por script com o opentype.js. Não há `<text>` nem dependência de fonte instalada. A equipe escolheu a fonte numa comparação com Poppins e Lexend, por ser geométrica e arredondada como o nome.
- **Tamanho:** a altura-x do slogan é 30% da do nome (31,8 unidades, fonte de cerca de 65,8). O espaçamento entre letras é de 2% do tamanho da fonte, além do kerning da fonte.
- **Posição:** linha de base do slogan 98 unidades abaixo da caixa do logotipo. O slogan define a largura do lockup (1081), e o logotipo fica centralizado sobre ele.
- **Cor:** o mesmo degradê vertical do nome (`#FAF9FF` → `#8B5CF6`), aplicado do topo das letras ao fim do "g". Contraste de pelo menos 4,80:1 com `#030417` em todo o slogan, como no nome.
- **Área de proteção:** dentro do lockup, o espaço entre logotipo e slogan é fixo e faz parte da assinatura. A área de proteção (altura-x do nome, 106 unidades) vale em volta do lockup inteiro.
- **Uso:** não mude o texto, a fonte nem a distância. Para outro slogan, gere um lockup novo com as mesmas regras.

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
| Nome do logotipo, topo do degradê | `color.on-surface` | `#FAF9FF` |
| Nome do logotipo, base do degradê, e pingo do "i" | `purple-500` | `#8B5CF6` |

**Exceção registrada:** a borda inferior direita usa o primitivo `blue-600`, fora da tabela da #194, para manter o contorno azulado da arte escolhida pela equipe. O contraste com `#030417` é de 3,23:1, acima do mínimo de 3:1 para gráficos não textuais (WCAG 1.4.11). As cores mais escuras (`#39149A`, `#17075B`) ficam só no interior da esfera, nunca na borda externa.

**Contraste do nome:** o degradê vertical vai de `#FAF9FF` (19,41:1 com `#030417`) a `#8B5CF6` (4,80:1). Cada canal de cor dos pontos intermediários fica entre os das duas pontas, então todo o nome fica acima de 4,5:1. O letreiro raster anterior terminava num azul-violeta de cerca de 3,2:1.

## Origem

- **Arte de referência:** gerada com o **Gemini**, plano **Pro**, modelo informado pelo operador como "Neon" no modo "high". A equipe escolheu a arte em 22/11/2026 na #194.
- **Referências de estilo enviadas ao Gemini:** o repositório do Orbity (com o ODS) e imagens de direcionamento criadas anteriormente pelo Codex, no plano Plus. Todas eram artes do próprio Orbity, sem ícones de outros apps.
- **Prompt final** (texto original enviado ao Gemini):

  > Faça uma analise meu repositorio para ter o contexto do projeto e a acesso ao ODS(orbity design system): github.com/Orbita83/Orbity
  > Criar a imagem main, descrita nas issues #194, #195, #196, #197, #198.
  > USE COMO EXEMPLO ESTAS: PRECISO DE DETALHES E CONSISTENCIA(passei imagens criadas pelo codex no plano plus como um direcionamento).

- **Termos de uso comercial:** conferidos em 23/11/2026.
  - **Gemini** (conta pessoal, plano Pro), conferido por MateusARJ: pelos [Termos de Serviço do Google](https://policies.google.com/terms), o Google não reivindica a propriedade do conteúdo gerado e não restringe o uso comercial, desde que se respeite a Política de Uso Proibido de IA Generativa. Os Termos Adicionais de IA Generativa deixam com o usuário a responsabilidade de não violar direitos de terceiros e avisam que a IA pode gerar resultados iguais ou parecidos para outras pessoas.
  - **Codex/ChatGPT** (conta pessoal; as imagens de direcionamento foram geradas no plano Plus, e a conta hoje está no plano gratuito), conferido por MailsonSousa88: pelos [Termos de Uso da OpenAI](https://openai.com/policies/row-terms-of-use/), o usuário tem os direitos sobre o resultado gerado, na medida permitida pela lei aplicável.
  - **Limitação:** uma imagem gerada só por IA pode não ter proteção de direito autoral e não garante exclusividade. Por isso, a arte gerada serviu apenas de referência: o símbolo final foi redesenhado em vetor, com geometria e cores próprias. A origem por IA está registrada aqui, como pede a política de transparência.
  - **Marcas de terceiros:** busca na Google Play por "planet", "study" e "habit", feita por MateusARJ em 23/11/2026 (seção 8 da #194). Só a busca "planet" trouxe um ícone com planeta e anel, o do app *Planet Explorer*. Ele não se confunde com o do Orbity: é amarelo e tem quatro pontos nos cantos, enquanto o Orbity é violeta, sem pontos, com borda azulada e folga entre anel e esfera. Se a marca for registrada no Brasil, consultar também a base do INPI.
- **Ajustes manuais:** a imagem gerada (JPEG 1024×1024) não foi usada diretamente. O símbolo foi redesenhado em SVG geométrico (um círculo e duas elipses com gradientes e máscaras), mantendo a inclinação, as proporções e a folga entre anel e esfera da arte escolhida. Depois: redução para caber no círculo de 600 px, troca das cores pelos tokens acima e criação da silhueta monocromática com a mesma geometria.
- **Exportação:** PNGs gerados do SVG com o resvg (`@resvg/resvg-js`), em 23/11/2026.

### Logotipo vetorial (#230)

- **Decisão da equipe (opção A, registrada na #230):** redesenhar em vetor as letras do letreiro raster anterior, gerado por IA junto com o banner. A identidade foi mantida, e as espessuras, o espaçamento e o alinhamento foram corrigidos. A referência foi o letreiro do `orbity-logo.png` anterior, com o "t" separado do "y", e não o do banner, que ligava os dois.
- **Como foi feito:** em 24/11/2026, as métricas foram medidas no PNG anterior (linha de base, altura-x, hastes e espaços), e as letras foram reconstruídas com formas geométricas por script, com o Claude Code, sob a orientação de MateusARJ. A união das formas em contornos usou o paper.js, e a exportação dos PNGs, o resvg.
- **Correções em relação ao raster:**
  - o contrabojo do "O" foi centralizado (antes, o traço tinha 24 px de um lado e 37 px do outro);
  - todas as hastes ficaram com a mesma espessura;
  - o espaço entre o "t" e o "y" passou de 2 para 9 unidades;
  - o degradê passou a usar só tokens, com contraste de pelo menos 4,5:1.
- **Autoria:** o desenho vetorial não copia pixels da imagem gerada por IA, mas foi feito com assistência de IA. Se a proteção de direito autoral do letreiro for importante, um membro da equipe deve revisar e ajustar as curvas num editor vetorial (Inkscape ou Figma) e registrar a revisão aqui.

### Lockup com slogan (#197)

- **Decisão:** a equipe achou o slogan anterior do gráfico de destaque, em Roboto Regular e lilás chapado, destoante do nome. Pediu um slogan no estilo do letreiro e vetorizado junto com o gráfico. O texto continua o aprovado. Entre as opções comparadas (Outfit, Poppins e Lexend, nos pesos 500 e 600), MateusARJ escolheu a Outfit SemiBold em 25/11/2026.
- **Fonte:** [Outfit](https://github.com/Outfitio/Outfit-Fonts), versão 1.100, Copyright 2021 The Outfit Project Authors, licença [SIL Open Font License 1.1](https://openfontlicense.org). A OFL permite usar a fonte e os contornos gerados dela em material comercial, como logotipos e a ficha da loja, sem atribuição visível. Os arquivos da fonte não entram no repositório: só os contornos do slogan.
- **Como foi feito:** os contornos foram gerados por script com o opentype.js, a partir do pacote `@fontsource/outfit` 5.1.0, e o lockup foi montado com o logotipo sem alteração. Sem IA na geração.

Issues: #194 (símbolo), #230 (logotipo) e #197 (lockup com slogan). Acompanhamento: #198.
