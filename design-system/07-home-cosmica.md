# Tela inicial cósmica — protótipo para revisão

Direção visual autorizada pelo operador em 22/10/2026, baseada na referência de três telas fornecida na conversa. Para esta tela, esta especificação substitui as restrições anteriores de paleta, tipografia, geometria do planeta e comportamento de ocultação da navbar. Os componentes existentes continuam com seus temas claro e escuro; `PrimaryButton` e `NavBar` possuem a variante explícita `appearance="cosmic"`.

## Composição

- **Recolhido:** campo de estrelas vetorial, visualizador com planeta centralizado, contador de sequência central e convite “Deslize para explorar”. O painel fica completamente recolhido.
- **Intermediário:** cenário deslocado para cima, painel com alça, Modo Foco, progresso diário e conquistas. A navbar permanece visível.
- **Expandido:** painel abaixo do cabeçalho; acrescenta Última sessão e Como funciona?. A navbar permanece visível.
- **Sessão em andamento:** contador regressivo e ação para encerrar foco. A navbar fica oculta durante a sessão.

Abertura por toque no planeta, toque no convite ou arraste vertical. O painel acompanha o dedo durante o swipe. A alça permite arrastar em qualquer posição de rolagem; o conteúdo permite puxar para baixo quando o gesto começa no topo da lista. Quando o conteúdo está rolado, o gesto permanece na lista. Um swipe para baixo reduz um estágio; um arraste longo pode recolher completamente. Movimentos curtos retornam à posição anterior, e a alça continua alternando os estágios por toque. `Escape` recolhe o painel. O conteúdo interno rola quando a altura ou a fonte ampliada exigem. As transições automáticas respeitam a preferência de movimento reduzido do sistema e a opção local em Configurações.

## Tokens da variante

A implementação usa `cosmicTokens` em `src/view/theme/tokens.ts`. Os valores abaixo são decisões deste protótipo, não aliases implícitos dos temas anteriores.

| Grupo | Decisão |
| --- | --- |
| Fundo | `background #030417`; área externa de preview `desktop #07081F` |
| Painel | Gradiente `sheet #0D0D29` → `sheetEnd #08091D`; contorno `sheetBorder #373064` |
| Cards | Gradiente `card #141332` → `cardEnd #0D0E26`; contorno `cardBorder #232044` |
| Texto | `text #FAF9FF`; secundário `muted #BBB6E3`; navegação/chevrons `inactive #9990CB` |
| Ação | Gradiente `action #7137F5` → `actionEnd #703BF6`; texto claro; hover `#8252FC` e feedback pressionado |
| Acessibilidade | Foco `#D4A3FF`; texto escalável; nomes de controles e estados de seleção; modal nativo para detalhes |
| Progresso | Trilha `#232052`; gradiente `#8A42FA` → `#713BF5`; altura 17 dp; preenchimento proporcional exato |
| Conquistas | Aro ativo `#C47EFF`, ícones pendentes `#8C7BCB`, contorno pendente `#2B2654`; cadeado e descrição acessível |
| Tipografia | Marca 28/36; sequência 56/64; título 15/20; corpo 13/18; botão 16/24; legenda 12/16; navbar 11/16 |
| Forma | Botão 15 dp; card 18 dp; painel 32 dp; preview 38 dp; medalhas circulares de 56 dp |
| Movimento | Painel 380 ms; curva suave; atualização instantânea com movimento reduzido |
| Visualizador | `planet.aspectRatio 0.85`; esfera e anéis em SVG; estrelas determinísticas; sequência como texto real |
| Paleta do planeta | Realce `#EBACFF`, luz `#BD6AFF`, superfície `#8840E9`, relevo `#5320B2`, sombra `#39149A`, noite `#17075B`, borda `#D08BFF`, anel `#A95BFA`, realce do anel `#E8B5FF` e brilho `#8236D9` |
| Swipe | Ativação após 10 dp; movimento intencional de 48 dp ou velocidade de 0,55 dp/ms; projeção de 160 ms; limites nos três pontos de ancoragem |

No navegador, a tela é centralizada com largura máxima de 430 dp. No mobile, ocupa a largura disponível e respeita as áreas seguras. A barra de status ilustrativa “9:41” aparece apenas no preview web; Android/iOS usam a barra real do sistema.

## Arte e implementação

O visualizador usa `react-native-svg`, já presente no projeto. `PlanetIllustration` desenha esfera, iluminação, relevo e anéis em camadas vetoriais. `PlanetStreakView` centraliza o contador e recebe a sequência da ViewModel, sem manter uma cópia independente. `CosmicStarfield` produz o campo de estrelas de forma determinística. O deslocamento do planeta acompanha o painel; não há imagem de fundo, textura raster ou contexto WebGL. A ilustração PNG da iteração anterior foi preservada como arte de referência e não é mais importada pela tela. Este protótipo não implementa rotação axial ou evolução visual por ponto de sequência.

`HomeScreen` compõe a tela, `FocusBottomSheet` organiza os cards e `CosmicIcon` fornece os ícones. `useActivitySheetMotion` coordena arraste, limites, velocidade de soltura, rolagem e transições. O estado fica na ViewModel; dados e sessões usam o repositório em memória. Encerrar foco registra somente minutos efetivamente decorridos, sem adicionar os dez minutos fixos da versão anterior. Não há persistência entre recarregamentos. As outras abas permitem demonstrar a seleção, sem implementar seus módulos.

## Revisão

Execute `npm run storybook` e abra **Telas → Início cósmico → Referência · três estados lado a lado**. Há também histórias individuais para os estágios, foco ativo, estado vazio, carregamento e uma história com interação automatizada. `npm run web` abre o protótipo na rota inicial do Expo.

O visualizador isolado fica em **Design System → Planeta e sequência**, com controle do número de dias e exemplos de 0, 12 e 365 dias.

As verificações de lint, tipos e builds são registradas na entrega. A existência de uma história de interação não comprova sua execução; validação real em navegador e em Android/iOS deve ser identificada separadamente.

Na primeira iteração, lint, tipos, builds do Expo/Storybook e três verificações da ViewModel passaram. Na revisão do visualizador, lint, tipos e ambos os builds passaram novamente, assim como as três verificações existentes da ViewModel. Cinco verificações isoladas adicionais cobriram resolução de swipe/flick, limites em viewport pequeno, acompanhamento do dedo e recolhimento, interação com rolagem e retorno após cancelamento. Os testes usam um adaptador de animação sem duração real; não substituem a validação por toque em aparelho. O SVG do planeta foi renderizado e inspecionado visualmente de forma isolada. Não houve captura da tela completa no navegador ou em aparelho nesta sessão.
