# Materiais da Google Play

Imagens da ficha do Orbity na Google Play. Estes arquivos não entram no build do app; são enviados manualmente no Play Console, conforme `docs/08-distribution/submissao-google-play.md`.

> **Situação atual:** o ícone da loja, o gráfico de destaque e as seis capturas de celular estão prontos e aguardam a aprovação da equipe na #197. Os materiais devem mostrar o app real e ser aprovados antes do envio (#177).

Assets do build (ícone do app e splash) ficam em `assets/app/`.

## Estrutura

| Pasta | Conteúdo |
| :--- | :--- |
| `icon/` | Ícone da loja (`icon-512.png`) |
| `feature-graphic/` | Gráfico de destaque: o mestre vetorial `feature-graphic.svg` e o `feature-graphic.png` exportado dele, que vai para a loja |
| `screenshots/phone/` | Capturas de celular, numeradas na ordem de exibição (`01-inicio.png`, `02-tarefas.png`, ...) |
| `screenshots/tablet/` | Capturas de tablet (opcional) |

## Requisitos

| Asset | Dimensão | Formato | Regras |
| :--- | :--- | :--- | :--- |
| Ícone da loja | 512×512 | PNG 32 bits, sRGB, até 1024 KB | Quadrado cheio e opaco, sem cantos arredondados e sem sombra; o Play aplica a máscara (raio de 30%) e a sombra. |
| Gráfico de destaque | 1024×500 | JPEG ou PNG 24 bits, sem alfa | Conteúdo importante afastado das bordas, numa zona segura central de cerca de 820×340. Se houver vídeo, o Play pode sobrepor um botão de reprodução no centro. |
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
- **`feature-graphic/feature-graphic.svg`** (mestre) e **`feature-graphic/feature-graphic.png`** (enviado à loja): gráfico 100% vetorial, montado por script em 25/11/2026. O PNG é exportado do SVG com o resvg: 1024×500, 24 bits, sem alfa. Ao alterar o gráfico, altere o SVG e exporte o PNG de novo.
  - **Fundo:** desenhado em SVG, sem IA. Degradê de `#0D0D29` a `#030417`, brilho suave de `#7137F5` no centro e estrelas pequenas longe do centro. Também tem dois arcos orbitais finos em `#7137F5`, com pontos em `#A95BFA` (como no banner do ODS), e dois planetas desfocados nos cantos.
  - **Logotipo e slogan:** o lockup `design-system/images/brand/orbity-logo-slogan.svg`, aplicado sem alteração, com o logotipo em 560 px de largura. O slogan "Organize seus estudos no seu ritmo", escolhido pela equipe, está em contornos vetoriais da Outfit SemiBold, com o mesmo degradê do nome e cerca de 37 px. A construção do lockup está no `design-system/images/brand/README.md`.
  - **Zona segura:** o lockup ocupa o bloco de x 204–820 e y 149–351, dentro da zona central de 820×340 (x 102–922, y 80–420).
  - **Texto:** o nome e o slogan ocupam cerca de 11% da área, abaixo do limite de 20%.
- **`screenshots/phone/`:** capturas reais do app, num build de release no emulador Pixel 7 (Android 16, 1080×2400, 420 dpi). As capturas de `01` a `05` são de 23/11/2026. A `06-perfil.png` é de 25/11/2026, feita num build da `development` que já inclui as correções do Perfil (#188, PRs #250 e #251):
  - **Barra de status:** limpa com o *demo mode* do Android (9:41, bateria cheia, sem notificações).
  - **Dados:** fictícios, de estudante. Nenhum nome, e-mail ou dado pessoal real. No Perfil, o nome é "Bia" e a sequência de 1 dia vem de uma tarefa concluída no próprio dia, como na tela inicial da `01-inicio.png`. Conquistas e horas de estudo aparecem zeradas porque o app ainda não as calcula.
  - **Moldura:** 1080×1920, fundo em degradê de `#0D0D29` a `#030417`, legenda em Roboto Bold de 60 px em `#FAF9FF` (duas linhas) e a captura reduzida, com cantos de 32 px. Montada por script (resvg), sem edição da tela.
  - **Legendas:** as sugeridas na #197, a aprovar pela equipe.

| Arquivo | Tela | Legenda |
| :--- | :--- | :--- |
| `01-inicio.png` | Início: planeta com a sequência e o painel recolhido | Acompanhe sua constância |
| `02-tarefas.png` | Tarefas: tags de categoria, prazos, uma concluída e uma fixada | Organize suas tarefas de estudo |
| `03-nova-tarefa.png` | Nova tarefa: formulário com datas, horas e categoria | Crie tarefas em poucos toques |
| `04-rotinas.png` | Rotinas: lista com ícones e dias da semana | Monte rotinas para cada dia |
| `05-detalhe-rotina.png` | Detalhe da rotina: progresso do dia | Veja seu progresso do dia |
| `06-perfil.png` | Perfil: nome, métricas da jornada e atalhos | Valorize sua trajetória |

**Limitações conhecidas:**

- Os títulos das tarefas e rotinas foram escolhidos sem acento, porque o `adb input text` usado para preenchê-los não digita acentos.

## Fontes

Conferidas em 21/11/2026:

- [Google Play: recursos de visualização](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Google Play: especificações do ícone](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)
