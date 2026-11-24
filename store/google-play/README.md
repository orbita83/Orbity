# Materiais da Google Play

Imagens da ficha do Orbity na Google Play. Estes arquivos não entram no build do app; são enviados manualmente no Play Console, conforme `docs/08-distribution/submissao-google-play.md`.

> **Situação atual:** o ícone da loja e as capturas de celular estão prontos e aguardam a aprovação da equipe na #197. O gráfico de destaque ainda não foi feito: ele depende do logotipo vetorial (#230). Os materiais devem mostrar o app real e ser aprovados antes do envio (#177).

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

## Origem das imagens

Nenhuma imagem desta pasta foi gerada por IA.

- **`icon/icon-512.png`:** exportado do `design-system/images/brand/orbity-symbol.svg` sobre `#030417` (o mesmo desenho do `assets/app/icon/icon.png`). PNG 512×512 opaco.
- **`screenshots/phone/`:** capturas reais do app, feitas em 23/11/2026 num build de release no emulador Pixel 7 (Android 16, 1080×2400, 420 dpi):
  - **Barra de status:** limpa com o *demo mode* do Android (9:41, bateria cheia, sem notificações).
  - **Dados:** fictícios, de estudante. Nenhum nome, e-mail ou dado pessoal real.
  - **Moldura:** 1080×1920, fundo em degradê de `#0D0D29` a `#030417`, legenda em Roboto Bold de 60 px em `#FAF9FF` (duas linhas) e a captura reduzida, com cantos de 32 px. Montada por script (resvg), sem edição da tela.
  - **Legendas:** as sugeridas na #197, a aprovar pela equipe.

| Arquivo | Tela | Legenda |
| :--- | :--- | :--- |
| `01-inicio.png` | Início: planeta com a sequência e o painel recolhido | Acompanhe sua constância |
| `02-tarefas.png` | Tarefas: tags de categoria, prazos, uma concluída e uma fixada | Organize suas tarefas de estudo |
| `03-nova-tarefa.png` | Nova tarefa: formulário com datas, horas e categoria | Crie tarefas em poucos toques |
| `04-rotinas.png` | Rotinas: lista com ícones e dias da semana | Monte rotinas para cada dia |
| `05-detalhe-rotina.png` | Detalhe da rotina: progresso do dia | Veja seu progresso do dia |

**Limitações conhecidas:**

- Os títulos das tarefas e rotinas foram escolhidos sem acento, porque o `adb input text` usado para preenchê-los não digita acentos.
- A tela de Perfil ficou de fora porque mostra dados de demonstração fixos (#188). Ela volta às capturas quando a #188 for corrigida.

## Fontes

Conferidas em 21/11/2026:

- [Google Play: recursos de visualização](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Google Play: especificações do ícone](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)
