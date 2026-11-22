# Assets do aplicativo

Imagens usadas pelo build do Orbity: ícone do app, ícone adaptativo do Android e splash screen. Os caminhos são lidos por `app.json`; ao renomear ou mover um arquivo, atualize a chave correspondente.

> **Situação atual:** todos os arquivos desta pasta ainda são placeholders herdados do template do Expo e serão substituídos pela identidade visual do Orbity. Os requisitos abaixo valem para os arquivos definitivos.

Imagens usadas pelas telas ficam em `assets/images/`. Materiais da ficha da Google Play ficam em `store/google-play/`.

## Estrutura

| Arquivo | Chave em `app.json` | Placeholder atual |
| :--- | :--- | :--- |
| `icon/icon.png` | `expo.icon` (Android e iOS) | 1024×1024 |
| `icon/adaptive-foreground.png` | `expo.android.adaptiveIcon.foregroundImage` | 512×512 |
| `icon/adaptive-background.png` | `expo.android.adaptiveIcon.backgroundImage` | 512×512 |
| `icon/adaptive-monochrome.png` | `expo.android.adaptiveIcon.monochromeImage` | 432×432 |
| `splash/splash-icon.png` | plugin `expo-splash-screen` → `image` | 228×213 |

## Requisitos

| Asset | Dimensão | Formato | Regras |
| :--- | :--- | :--- | :--- |
| Ícone principal | 1024×1024 | PNG opaco | Quadrado cheio, sem cantos arredondados e sem pixels transparentes. O build gera os demais tamanhos. |
| Ícone adaptativo: frente | 1024×1024 | PNG com transparência | Conteúdo dentro da área segura central (66/108 do lado, cerca de 626 px). O terço externo pode ser cortado pela máscara do launcher. |
| Ícone adaptativo: fundo | Mesma dimensão da frente | PNG opaco | Obrigatório ter a mesma dimensão da frente. Alternativa: remover `backgroundImage` e usar só `backgroundColor`. |
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
