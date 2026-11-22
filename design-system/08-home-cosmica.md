# Tela inicial cósmica — protótipo para revisão

> **Status (2026-11-15):** registro histórico do protótipo `feat/tela-principal-prototipo`. Desde a D23 do design, a Tela Inicial segue o protótipo do Claude Design ("Orbity · Protótipo Início e Tarefas", telas 1, 1.1 e 1.2); a tabela abaixo já reflete essa troca. Os valores visuais passam a seguir os tokens do ODS 1.2.0, conforme a tabela de tokens aprovada no design [`tela-inicial-base.md`](../docs/designs/tela-inicial-base.md) (Etapa 0.2a). A variante `appearance="cosmic"` deu lugar a `theme={themes.cosmic}`, e a sessão de foco, a última sessão e os diálogos ficaram fora da primeira entrega. Onde este texto divergir de [02-tokens.md](02-tokens.md) ou de [05-padroes.md](05-padroes.md), valem esses documentos.

Direção visual autorizada pelo operador em 22/10/2026, baseada na referência de três telas fornecida na conversa. Para esta tela, esta especificação substitui as restrições anteriores de paleta, tipografia, geometria do planeta e comportamento de ocultação da navbar. Os componentes existentes continuam com seus temas claro e escuro; `PrimaryButton` e `NavBar` possuem a variante explícita `appearance="cosmic"`.

## Composição

- **Recolhido:** campo de estrelas vetorial, visualizador com planeta centralizado, contador de sequência central e convite “Deslize para explorar”. O painel fica completamente recolhido.
- **Intermediário:** cenário deslocado para cima, painel com alça, Modo Foco, progresso diário e conquistas. A navbar permanece visível.
- **Expandido:** painel abaixo do cabeçalho; acrescenta Última sessão e Como funciona?. A navbar permanece visível.
- **Sessão em andamento:** contador regressivo e ação para encerrar foco. A navbar fica oculta durante a sessão.

Abertura por toque no planeta, toque no convite ou arraste vertical. O painel acompanha o dedo durante o swipe. A alça permite arrastar em qualquer posição de rolagem; o conteúdo permite puxar para baixo quando o gesto começa no topo da lista. Quando o conteúdo está rolado, o gesto permanece na lista. Um swipe para baixo reduz um estágio; um arraste longo pode recolher completamente. Movimentos curtos retornam à posição anterior, e a alça continua alternando os estágios por toque. `Escape` recolhe o painel. O conteúdo interno rola quando a altura ou a fonte ampliada exigem. As transições automáticas respeitam a preferência de movimento reduzido do sistema e a opção local em Configurações.

## Tokens da variante

O protótipo usava `cosmicTokens`; a integração substitui esse objeto pelos tokens de `src/view/theme/tokens.ts`. A tabela abaixo já está alinhada a eles.

| Grupo | Decisão |
| --- | --- |
| Fundo | `background #030417`; área externa de preview `desktop #07081F` |
| Painel | Gradiente `sheet #0D0D29` → `sheetEnd #08091D`; contorno `sheetBorder #373064` |
| Cards | Gradiente `card #141332` → `cardEnd #0D0E26`; contorno `cardBorder #232044` |
| Texto | `text #FAF9FF`; secundário `muted #BBB6E3`; navegação/chevrons `inactive #9990CB` |
| Ação | Gradiente `action #7137F5` → `actionEnd #703BF6`; texto claro; hover `#8648FA` (`cosmicColors.actionHover`) e pressionado por escala e opacidade |
| Acessibilidade | Foco `#D4A3FF`; texto escalável; nomes de controles e estados de seleção; modal nativo para detalhes |
| Progresso | Trilha `#232052`; gradiente `#8A42FA` → `#8648FA`; altura `size.progress-height` (20 dp); preenchimento proporcional exato |
| Conquistas | Aro ativo `#C47EFF`, ícones pendentes `#8C7BCB`, contorno pendente `#2B2654`; bloqueada mostra o símbolo esmaecido com selo de cadeado; descrição acessível |
| Tipografia | Marca `font.title` (24/32); sequência `font.streak` (64/64); título de card `font.card-title` (16/24, 600); descrição e texto de apoio `font.body-sm` (14/20); contador e botão `font.label`; navbar conforme `navbar.*` |
| Forma | Botão `radius.md` (12 dp); card `radius.lg` (16 dp); painel `radius.sheet` (24 dp); medalhas em caixa arredondada `achievement.size` (60 dp, `radius.lg`) |
| Movimento | Painel `motion.duration.medium` (300 ms) com `motion.easing.standard`; atualização instantânea com movimento reduzido |
| Visualizador | Desenho do protótipo em grade de 280 × 280 (aspecto 1): brilho, anel, esfera com crateras, lua e asteroides; estrelas e estrela cadente nas posições do protótipo; sequência como texto real |
| Paleta do planeta | Realce `#EBACFF`, luz `#BD6AFF`, superfície `#8840E9`, relevo `#5320B2`, sombra `#39149A`, noite `#17075B`, borda `#D08BFF`, anel `#A95BFA`, realce do anel `#E8B5FF` e brilho `#8236D9` |
| Swipe | Ativação após 10 dp; movimento intencional de 48 dp ou velocidade de 0,55 dp/ms; projeção de 160 ms; limites nos três pontos de ancoragem |

No mobile, a tela ocupa a largura disponível e respeita as áreas seguras, utilizando a barra de status real do sistema (Android/iOS).

## Arte e implementação

O visualizador usa `react-native-svg`, já presente no projeto. `PlanetIllustration` desenha esfera, iluminação, relevo e anéis em camadas vetoriais. `PlanetStreakView` centraliza o contador e recebe a sequência da ViewModel, sem manter uma cópia independente. `CosmicStarfield` produz o campo de estrelas de forma determinística. O deslocamento do planeta acompanha o painel; não há imagem de fundo ou textura raster. A ilustração PNG da iteração anterior foi preservada como arte de referência e não é mais importada pela tela. Este protótipo não implementa rotação axial ou evolução visual por ponto de sequência.

`HomeScreen` liga a ViewModel a `HomeScreenContent`, `FocusBottomSheet` organiza os cards e `MaterialSymbol` fornece os ícones. `useFocusSheetMotion` (na View) coordena arraste, limites, velocidade de soltura, rolagem, transições e a pose do planeta. O registro diário fica no SQLite no Android. A sessão de foco ativa ainda não está implementada. As outras abas permitem demonstrar a seleção, sem implementar seus módulos.

## Revisão

Execute `npm run storybook` e abra **Telas → Início cósmico → Referência · três estados lado a lado**. Há também histórias individuais para os estágios, foco ativo, estado vazio, carregamento e uma história com interação automatizada.

O visualizador isolado fica em **Design System → Planeta e sequência**, com controle do número de dias e exemplos de 0, 12 e 365 dias.

As verificações de lint, tipos e builds são registradas na entrega. A existência de uma história de interação não comprova sua execução; validação real em Android/iOS deve ser identificada separadamente.

Na primeira iteração, lint, tipos, builds do Expo/Storybook e três verificações da ViewModel passaram. Na revisão do visualizador, lint, tipos e ambos os builds passaram novamente, assim como as três verificações existentes da ViewModel. Cinco verificações isoladas adicionais cobriram resolução de swipe/flick, limites em viewport pequeno, acompanhamento do dedo e recolhimento, interação com rolagem e retorno após cancelamento. Os testes usam um adaptador de animação sem duração real; não substituem a validação por toque em aparelho. O SVG do planeta foi renderizado e inspecionado visualmente de forma isolada.
