# Materiais da Google Play

Imagens da ficha do Orbity na Google Play. Estes arquivos não entram no build do app; são enviados manualmente no Play Console, conforme `docs/08-distribution/submissao-google-play.md`.

> **Situação atual:** as pastas ainda estão vazias. Os materiais devem mostrar o app real e ser aprovados pela equipe antes do envio (#177).

Assets do build (ícone do app e splash) ficam em `assets/app/`.

## Estrutura

| Pasta | Conteúdo |
| :--- | :--- |
| `icon/` | Ícone da loja (`icon-512.png`) |
| `feature-graphic/` | Gráfico de destaque (`feature-graphic.png` ou `.jpg`) |
| `screenshots/phone/` | Capturas de celular, numeradas na ordem de exibição (`01-inicio.png`, `02-tarefas.png`, ...) |
| `screenshots/tablet/` | Capturas de tablet (opcional) |

## Requisitos

| Asset | Dimensão | Formato | Regras |
| :--- | :--- | :--- | :--- |
| Ícone da loja | 512×512 | PNG 32 bits, sRGB, até 1024 KB | Quadrado cheio e opaco, sem cantos arredondados e sem sombra; o Play aplica a máscara (raio de 30%) e a sombra. |
| Gráfico de destaque | 1024×500 | JPEG ou PNG 24 bits, sem alfa | Conteúdo importante afastado das bordas. |
| Capturas de celular | 2 a 8. Recomendado: pelo menos 4 em 1080×1920 (9:16) | PNG ou JPEG sem alfa, até 8 MB cada | Cada lado entre 320 e 3840 px; o lado maior pode ter no máximo 2,3 vezes o menor. |
| Capturas de tablet (opcional) | Mínimo de 4 | PNG ou JPEG | Cada lado entre 1080 e 7680 px; 9:16 ou 16:9. |
| Vídeo (opcional) | — | URL do YouTube | Público ou não listado, sem anúncios e sem restrição de idade. |

Regras gerais:

- Texto sobre as imagens deve ocupar no máximo 20% da área.
- Nomes de arquivo em kebab-case.
- Não inclua dados pessoais reais nas capturas.

## Fontes

Conferidas em 21/11/2026:

- [Google Play: recursos de visualização](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Google Play: especificações do ícone](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)
