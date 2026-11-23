# Assets do aplicativo

Imagens usadas pelo build do Orbity: ícone do app, ícone adaptativo do Android e splash screen. Os caminhos são lidos por `app.json`; ao renomear ou mover um arquivo, atualize a chave correspondente.

> **Origem:** todos os arquivos desta pasta são exportados dos mestres de `design-system/images/brand/` (#194). Não edite os PNGs à mão: altere o SVG-mestre e exporte de novo.

Imagens usadas pelas telas ficam em `assets/images/`. Materiais da ficha da Google Play ficam em `store/google-play/`.

## Estrutura

| Arquivo | Chave em `app.json` | Dimensão | Exportado de |
| :--- | :--- | :--- | :--- |
| `icon/icon.png` | `expo.icon` (Android e iOS) | 1024×1024, opaco | `orbity-symbol.svg` sobre `#030417` (mesmo desenho de `orbity-symbol-on-background.png`) |
| `icon/adaptive-foreground.png` | `expo.android.adaptiveIcon.foregroundImage` | 1024×1024, transparente | `orbity-symbol.svg` |
| `icon/adaptive-monochrome.png` | `expo.android.adaptiveIcon.monochromeImage` | 1024×1024, branco sobre transparência | `orbity-symbol-monochrome.svg` |
| `splash/splash-icon.png` | plugin `expo-splash-screen` → `image` | 1024×1024, transparente | `orbity-symbol.svg` |

O símbolo fica na mesma posição em todos os arquivos, a no máximo 294 px do centro, dentro do círculo de 600 px de diâmetro.

## Decisões

- **Fundo do ícone adaptativo: só cor (opção A da #195).** O fundo do símbolo é liso, então não existe `adaptive-background.png`. O `app.json` usa `adaptiveIcon.backgroundColor: "#030417"` (`cosmicTokens.color.background`), sem `backgroundImage`.
- **Splash (#196):** `backgroundColor: "#030417"`, o mesmo fundo da tela inicial, para não haver troca de cor entre o splash e o app. `imageWidth: 200` (dp): o símbolo fica com cerca de 106 dp de largura (medido no Android 16) e a no máximo 57 dp do centro, dentro do círculo de 192 dp do Android 12+. Foram comparados 150 (cerca de 80 dp, pequeno demais) e 240 (cerca de 127 dp, mais perto do limite e sem ganho de leitura). O 200 mantém a mesma proporção do símbolo no ícone do launcher.

## Requisitos

| Asset | Dimensão | Formato | Regras |
| :--- | :--- | :--- | :--- |
| Ícone principal | 1024×1024 | PNG opaco | Quadrado cheio, sem cantos arredondados e sem pixels transparentes. O build gera os demais tamanhos. |
| Ícone adaptativo: frente | 1024×1024 | PNG com transparência | Conteúdo dentro da área segura central (66/108 do lado, cerca de 626 px). O terço externo pode ser cortado pela máscara do launcher. |
| Ícone adaptativo: fundo | Mesma dimensão da frente | PNG opaco | Só se o fundo tiver degradê ou imagem; deve ter a mesma dimensão da frente. Hoje não é usado: o fundo vem de `backgroundColor`. |
| Ícone monocromático | 1024×1024 | PNG, silhueta de uma cor sobre transparência | Mesma área segura da frente. Usado no ícone temático do Android 13+. |
| Ícone do splash | 1024×1024 | Somente PNG, com transparência | Outro formato faz o build de produção falhar. No Android 12+, o ícone sem fundo ocupa 288 dp e o desenho deve caber num círculo de 192 dp; com fundo de ícone, 240 dp e círculo de 160 dp. |

Regras gerais:

- Cores de fundo (`backgroundColor` do ícone adaptativo e do splash) devem vir dos tokens de `design-system/02-tokens.md`. O fundo do splash precisa ser uma cor única e opaca.
- `imageWidth` do splash é dado em dp e define o tamanho exibido do ícone; revise-o ao trocar a arte.
- Nomes de arquivo em kebab-case.

## Fontes

Conferidas em 21/11/2026:

- [Expo: splash screen e ícone do app](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
- [Android: splash screen](https://developer.android.com/develop/ui/views/launch/splash-screen)
- [Android: ícones adaptativos](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
