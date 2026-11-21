# Guias e Convenções de Código: React Native, Expo Router e MVVM

Este documento estabelece as convenções oficiais de código e arquitetura para o desenvolvimento de aplicativos mobile com **React Native**, **TypeScript**, **Expo Router** e **MVVM**, baseadas na estrutura adotada no livro *Tutoriais de PDM: Desenvolvimento Mobile com React Native e Expo*.

---

## Convenções de Nomenclatura e Código (React Native)

- **Funções normais:** `camelCase` (ex: `handleSubmit`, `fetchData`)
- **Componentes funcionais:** `PascalCase` (ex: `Button`, `UserProfile`)
- **Arquivos gerais:** `camelCase` em `src/model/`, `src/usecase/`, `src/infra/` e `src/di/`, incluindo testes (`.test.ts`), suítes de contrato (`.contract.ts`) e fixtures (`.fixture.ts`), como no livro (Cap. 10, Figura 10.2). Arquivos que contêm **só uma interface** recebem o prefixo `i` (Seção 10.4).

  | Camada | Exemplos |
  | :--- | :--- |
  | `src/model/` | `entities/localDate.ts`, `entities/studentProfile.ts`, `datasources/iTaskDataSource.ts`, `services/iClockService.ts`, `errors.ts`, `__fixtures__/task.fixture.ts` |
  | `src/usecase/` | `iTaskUseCases.ts`, `taskUseCases.ts`, `taskUseCases.test.ts` |
  | `src/infra/` | `datasources/sqliteTaskDataSource.ts`, `datasources/taskDataSource.contract.ts`, `services/systemClockService.ts`, `database/iSqlExecutor.ts` |
  | `src/di/` | `container.ts`, `persistence.ts` |

  - **Arquivos da `view` que não são telas nem componentes** (textos, hooks e fixtures) também usam `camelCase`: `src/view/homeCopy.ts`, `src/view/theme/useReduceMotion.ts`, `src/view/__fixtures__/taskList.fixture.ts`. Assim, `kebab-case` fica só para rotas e telas, e `PascalCase` só para componentes.
- **Arquivos de View e ViewModel:**

  | Tipo de arquivo | Nome do arquivo | Exemplo |
  | :--- | :--- | :--- |
  | Componente de **tela** em `src/view/` | `kebab-case.tsx`, **idêntico** ao do módulo de rota em `src/app/` que o re-exporta | `src/view/tasks.tsx` ↔ `src/app/tasks.tsx` |
  | Parte de apresentação de uma tela em `src/view/` (usada só por ela) | `kebab-case.tsx`: nome da tela + `-content` | `src/view/tasks-content.tsx` |
  | Componente **reutilizável** em `src/view/components/` | `PascalCase.tsx` | `src/view/components/PrimaryButton.tsx` |
  | Arquivo da ViewModel em `src/viewmodel/` | `camelCase.ts` com o **mesmo nome** do hook exportado (`useNomeViewModel.ts`) | `src/viewmodel/useTasksViewModel.ts` |

  - **Telas na View (`src/view/`):** só o **arquivo** segue o nome da rota; o identificador do componente continua em `PascalCase` com sufixo `Screen` (ex.: `src/view/tasks.tsx` exporta `TasksScreen`; `src/view/index.tsx` exporta `HomeScreen`, a tela da rota inicial `src/app/index.tsx`). Histórias e testes da tela usam o mesmo nome (`tasks-content.stories.tsx`, `tasks-content.test.tsx`).
  - **Componentes de UI na View (`src/view/components/`):** Identificador do componente e arquivo em `PascalCase.tsx` (ex: `src/view/components/UserProfile.tsx`, `src/view/components/PrimaryButton.tsx`). Histórias e testes usam o mesmo nome (`PrimaryButton.stories.tsx`, `PrimaryButton.test.tsx`).
  - **Arquivos da ViewModel (`src/viewmodel/`):** Arquivo em `camelCase.ts` com o mesmo nome do hook que exporta, no formato `useNomeViewModel.ts` (ex: `src/viewmodel/useHomeViewModel.ts` exporta `useHomeViewModel`; `src/viewmodel/useLoginViewModel.ts` exporta `useLoginViewModel`; `src/viewmodel/useTimestampViewModel.ts` exporta `useTimestampViewModel`). Testes usam o mesmo nome (`useHomeViewModel.test.ts`), um por arquivo de ViewModel.
  - **Hooks da ViewModel:** Função exportada em `camelCase` com prefixo `use` seguido do nome da tela em PascalCase e sufixo `ViewModel` (ex: `useHomeViewModel()`, `useTimestampViewModel()`).
  - **Retorno da ViewModel:** dois tipos exportados, `NomeState` e `NomeActions`, e retorno em tupla `[state, actions]`, como no livro (Cap. 10, Seção 10.10). A tela desestrutura `const [state, actions] = useNomeViewModel();` e repassa estado e ações à apresentação. Uma ViewModel sem estado próprio declara `NomeState = Record<never, never>` e retorna `[{}, { ...ações }]`.
    ```ts
    export function useTimestampViewModel(): [TimestampState, TimestampActions] {
      // ...
      return [{ label, loading, error }, { handleGenerate }];
    }
    ```
- **Módulos de rota em `src/app/`:** Arquivos em `kebab-case.tsx` (ex: `src/app/index.tsx`, `src/app/tasks.tsx`, `src/app/new-task.tsx`) que determinam a rota no Expo Router, importam como `default` a tela da `view` **de mesmo nome** e a exportam novamente como `default`.

---

## Componentes e Exportações

### Declaração de Componentes
* **Arrow Functions:** Todos os componentes React Native devem ser declarados como constantes utilizando *arrow functions*:
  ```typescript
  const MyComponent = () => {
    return (
      <View>
        <Text>Conteúdo</Text>
      </View>
    );
  };
  ```

### Padrão de Exportação e Roteamento (`src/view/` → `src/app/`)
* **1. Componente de Tela na View (`src/view/`)**:
  * O componente de tela é implementado em arquivo `kebab-case.tsx` em `src/view/`, com o mesmo nome da rota, e deve conter obrigatoriamente um **`export default`** ao final do arquivo:
  ```typescript
  // src/view/login.tsx
  const LoginScreen = () => { ... };

  export default LoginScreen;
  ```
* **2. Módulo de Rota no App (`src/app/`)**:
  * Em `src/app/`, cria-se o módulo com o **mesmo nome** do arquivo da tela, em `kebab-case.tsx` (determinando a rota no Expo Router), **importa-se o componente de tela como `default`** da camada `view` e **exporta-se como `default` novamente**:
  ```typescript
  // src/app/login.tsx
  import LoginScreen from "../view/login";

  export default LoginScreen;
  ```
* **3. Componentes Reutilizáveis (`src/view/components/`)**:
  * Utilizar preferencialmente **Export Nomeado** (*Named Export*) em arquivos `PascalCase.tsx`:
  ```typescript
  // src/view/components/UserProfile.tsx
  export const UserProfile = ({ name, role }: UserProfileProps) => { ... };
  ```

---

## Expo Router e Navegação

### Convenções de Roteamento
1. **`index.tsx`**: Funciona como a página inicial da pasta onde está localizado (`src/app/index.tsx` = `/`).
2. **`_layout.tsx`**: Componente de layout que envolve todas as rotas de sua pasta, retornando um navegador (`<Stack />`, `<Tabs />` ou `<Drawer />`).
3. **`[id].tsx` (Colchetes)**: Cria uma rota dinâmica. O parâmetro é lido via `useLocalSearchParams<{ id: string }>()`.
4. **`(grupo)` (Parênteses)**: Organiza rotas e aplica layouts específicos sem adicionar o nome do grupo à URL.
5. **`+not-found.tsx`**: Rota tratadora de endereços inexistentes (404).

### Navegação na ViewModel
Seguindo o livro de referência (Cap. 10, Seções 10.3, 10.10 e 10.11), **quem navega é a ViewModel**. A View recebe apenas estado e ações e **não chama hooks de navegação**.

* **Na ViewModel (`src/viewmodel/`)**:
  * Navegar com o objeto `router` do `expo-router` dentro de ações expostas à tela (ex.: `handleCreateTask`, `handleOpenRoutine(id)`, `handleClose`).
  * Métodos comuns: `router.navigate()`, `router.push()`, `router.replace()`, `router.back()`, `router.setParams()`, `router.dismissTo()`.
  * Usar `router.replace()` para fluxos lineares onde não faz sentido retornar (ex.: tela de Login para Home).
  * Ler os parâmetros da rota com `useLocalSearchParams` na própria ViewModel. Quando a ViewModel também aceita o valor por parâmetro (para testes e histórias), o parâmetro substitui a rota.
  * Reagir à tela ganhando foco (`useFocusEffect`), ajustar opções do navegador (`useNavigation().setOptions`) e tratar o voltar do Android (`BackHandler`) também na ViewModel.
  * Passar rotas dinâmicas como objeto, para manter a validação de *typed routes*:
    ```ts
    const handleOpenRoutine = useCallback((id: string) => {
      router.navigate({ pathname: "/routine-details", params: { id } });
    }, []);
    ```
* **Na View (`src/view/`)**:
  * Não importar `useRouter`, `useLocalSearchParams`, `useNavigation`, `useFocusEffect` nem `<Link>`. Um toque que navega chama uma ação da ViewModel (ex.: `onPress={handleOpenSettings}`).
  * Componentes reutilizáveis que levam a outro lugar recebem a ação por props (ex.: `onPress`, `onReturn`), sem conhecer a rota.
  * **Exceção:** a `MainTabBar` é a barra de abas do próprio navegador. Ela recebe `navigation` e `state` por props do `<Tabs />` (em `src/app/_layout.tsx`) e não chama hooks de navegação.
* **Testes e histórias**:
  * Nos testes de ViewModel, mockar o `expo-router` (`router`, `useLocalSearchParams`, `useFocusEffect`, `useNavigation`) e verificar as ações de navegação.
  * O Storybook substitui o `expo-router` por `.storybook/mocks/expo-router.ts`, que registra a navegação no painel *Actions*.

---

## TypeScript e Tipagem

* **Modo Estrito:** Manter `"strict": true` no `tsconfig.json`.
* **Props Explicitamente Tipadas:** Todo componente reutilizável deve definir um tipo para suas *props*:
  ```typescript
  type UserProfileProps = {
    name: string;
    role: string;
    imageUrl: string;
  };

  export const UserProfile = ({ name, role, imageUrl }: UserProfileProps) => { ... };
  ```
* **Estado Tipado:** Especificar o tipo no `useState` quando não puder ser inferido automaticamente:
  ```typescript
  const [count, setCount] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  ```
* **Parâmetros de Rota:** Lembrar que valores retornados por `useLocalSearchParams` sempre chegam como `string` e devem ser convertidos explicitamente caso o valor original seja numérico (ex: `Number(id)`).

---

## Estilização com StyleSheet e Flexbox

### Regras do StyleSheet
* **`StyleSheet.create` ao Final:** Declarar as folhas de estilo no final do arquivo, após a definição do componente, mantendo a estrutura JSX visível primeiro.
* **Sem CSS Inline:** Evitar objetos de estilo *inline* diretamente na propriedade `style` do JSX.
* **Nomes semânticos baseados no PAPEL:** Nomear os estilos em inglês, como os demais identificadores de `src/` (`AGENTS.md`, Seção 3), de acordo com a função do elemento na tela (`card`, `title`, `footer`), **NUNCA** de acordo com a sua aparência visual (`blueBox`, `font20`).
* **Só tokens:** Cores, espaçamentos, raios, tipografia e sombras vêm do tema (`themes.<modo>` em `src/view/theme/tokens.ts`, espelho de `design-system/02-tokens.md`), nunca de valores literais.
* **Unidades de Medida:** Números em `StyleSheet` representam *pixels independentes de densidade* (`dp`), sem especificação de string como `px` ou `rem`.

### Layout com Flexbox
* **Eixo Padrão:** No React Native, o valor padrão de `flexDirection` é `'column'` (os elementos são empilhados na vertical).
* **Espaçamento Uniforme:** Dar preferência à propriedade `gap` (ou `rowGap`/`columnGap`) para espaçar elementos filhos em contêineres flex, em vez de aplicar `margin` individual em cada filho.
* **Ajuste Proporcional:** Usar `flex: 1` para contêineres principais ocuparem todo o espaço disponível na tela.

### Sombras
Usar os tokens de sombra do tema na propriedade `boxShadow` (ODS 1.2), que vale para Android e web. `elevation` continua disponível só como alternativa no Android, pelo token `theme.elevation.card`:
```typescript
const theme = themes.cosmic;

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    boxShadow: theme.shadow.modal,
  },
});
```

### Elementos Clicáveis e Acessibilidade de Toque
* Usar o componente `<Pressable>` em vez do `<Button>` nativo para botões que exigem estilização customizada (o componente `<Button>` nativo não aceita a propriedade `style`).
* Utilizar a propriedade `style` em forma de função para dar feedback visual ao toque:
  ```tsx
  <Pressable
    style={({ pressed }) => [
      styles.button,
      pressed && styles.buttonPressed,
    ]}
    onPress={handlePress}
  >
    <Text style={styles.buttonLabel}>Enviar</Text>
  </Pressable>
  ```
* **Área Mínima de Toque (Material 3 e WCAG 2.5.5 / 2.5.8):** Todo elemento interativo tocável deve assegurar uma área de contato mínima de **48 × 48 dp** no Android (Material 3) ou **44 × 44 pt** no iOS (Apple HIG).
* **Expansão com `hitSlop` ou Dimensões Mínimas:**
  * Em controles com dimensão visual menor que 48 dp (ex.: botões de ícone de 24 dp, caixas de checkbox de 20–24 dp ou chips), utilize container delimitado com `minHeight`/`minWidth` iguais a `theme.target.minSize` (48 dp) ou expanda a área interativa via propriedade `hitSlop`:
    ```tsx
    <Pressable
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPress={handleToggle}
      accessibilityRole="checkbox"
      accessibilityLabel="Marcar tarefa como concluída"
    >
      <Icon name="check" size={24} />
    </Pressable>
    ```
* **Espaçamento entre Alvos Adjacentes:** Manter separação mínima de pelo menos **8 dp** (`space.sm`) entre áreas de clique adjacentes para evitar acionamentos acidentais.

---
