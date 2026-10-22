# Catálogo de componentes

O Storybook do Orbity renderiza os componentes React Native no navegador usando
`@storybook/react-native-web-vite`. A configuração fica em `.storybook/`.

## Executar

```sh
npm ci
npm run storybook
```

Abra `http://localhost:6006`. Selecione **Design System → Botão primário**.
O comando abre o navegador automaticamente. Mantenha o terminal em execução
enquanto usa o catálogo e pressione Ctrl+C para encerrá-lo. Execute apenas uma
instância por vez: o erro `EADDRINUSE` indica que a porta 6006 já está ocupada.
Use **Controls** para alterar o rótulo e bloquear a interação; use **Tema** para
alternar entre claro e escuro. Os cliques são registrados no painel de ações.
Use Tab para inspecionar o foco por teclado.

## Gerar uma versão estática

```sh
npm run build-storybook
```

A saída fica em `storybook-static/` e não deve ser versionada.

## Adicionar um componente

1. Especifique o componente em `design-system/04-componentes/`.
2. Implemente-o em `src/view/components/`, usando os tokens de `src/view/theme/`.
3. Adicione um arquivo `NomeDoComponente.stories.tsx` ao lado do componente.
4. Declare `title`, `component`, `args` e `tags: ["autodocs"]`, seguindo o botão.
5. Documente variantes e limitações; exponha propriedades editáveis em Controls.

As stories ficam fora de `src/app/` para não se tornarem rotas do Expo Router.
Os comandos normais do Expo continuam iniciando o aplicativo.
Roboto é carregada localmente no catálogo pelo pacote `@fontsource/roboto`;
a integração nativa deverá carregar a fonte com Expo Font.

## Estado inicial

O botão possui exemplos de “Nova tarefa”, rótulo longo e bloqueio da ação.
Os valores de cor, espaço, tipografia e raio implementados vêm de
`design-system/02-tokens.md`.

Os tokens de hover, pressionado e desabilitado ainda não possuem valores
definitivos na especificação. Por isso, esses estados mantêm a aparência padrão
nesta implementação inicial. O estado desabilitado bloqueia a ação e expõe a
semântica acessível, mas ainda não deve ser considerado visualmente concluído.
O exemplo com ícone também está pendente.

O catálogo web permite revisar a apresentação, mas a validação de comportamento
e acessibilidade no Android/iOS deve ocorrer no aplicativo nativo.
