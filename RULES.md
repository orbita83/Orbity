@RULES

# Guias e Convenções de Código: React Native, Expo Router e MVVM

Este documento estabelece as convenções oficiais de código e arquitetura para o desenvolvimento de aplicativos mobile com **React Native**, **TypeScript**, **Expo Router** e **MVVM**, baseadas na estrutura adotada no livro *Tutoriais de PDM: Desenvolvimento Mobile com React Native e Expo*.

---

## Convenções de Nomenclatura e Código (React Native)

- **Funções normais:** `camelCase` (ex: `handleSubmit`, `fetchData`)
- **Componentes funcionais:** `PascalCase` (ex: `Button`, `UserProfile`)
- **Arquivos:** `kebab-case` com extensão apropriada (ex: `nome-arquivo.ts`, `nome-arquivo.tsx`)
- **Hooks (ViewModel):** Prefixo `use` seguido do nome da tela em PascalCase com sufixo `ViewModel` (ex: `useTelaViewModel()`)
- **Telas:**
  - Identificador/Componente: `PascalCase` com sufixo `Screen` (ex: `HomeScreen`, `LoginScreen`)
  - Nome do arquivo correspondente: `kebab-case.tsx` (ex: `home-screen.tsx`, `login-screen.tsx`)

---

## Componentes e Exportações

### Declaração de Componentes
* **Arrow Functions:** Todos os componentes React Native devem ser declarados como constantes utilizando *arrow functions*:
  ```typescript
  const MeuComponente = () => {
    return (
      <View>
        <Text>Conteúdo</Text>
      </View>
    );
  };
  ```

### Padrão de Exportação
* **Componentes de Tela (`src/app/`)**:
  * Devem conter obrigatoriamente um **`export default`** ao final do arquivo.
  * O nome do arquivo em *kebab-case.tsx* determina a rota no Expo Router.
  ```typescript
  // src/app/login-screen.tsx
  const LoginScreen = () => { ... };
  export default LoginScreen;
  ```
* **Componentes Reutilizáveis (`src/components/`)**:
  * Utilizar preferencialmente **Export Nomeado** (*Named Export*):
  ```typescript
  // src/components/user-profile.tsx
  export const UserProfile = ({ nome, tipo }: UserProfileProps) => { ... };
  ```

---

## Expo Router e Navegação

### Convenções de Roteamento
1. **`index.tsx`**: Funciona como a página inicial da pasta onde está localizado (`src/app/index.tsx` = `/`).
2. **`_layout.tsx`**: Componente de layout que envolve todas as rotas de sua pasta, retornando um navegador (`<Stack />`, `<Tabs />` ou `<Drawer />`).
3. **`[id].tsx` (Colchetes)**: Cria uma rota dinâmica. O parâmetro é lido via `useLocalSearchParams<{ id: string }>()`.
4. **`(grupo)` (Parênteses)**: Organiza rotas e aplica layouts específicos sem adicionar o nome do grupo à URL.
5. **`+not-found.tsx`**: Rota tratadora de endereços inexistentes (404).

### Boas Práticas de Navegação
* **Navegação Declarativa (`<Link>`)**:
  * Usar quando a navegação é uma consequência direta de um toque na interface.
  * Utilizar a propriedade `asChild` ao envolver componentes customizados como `<Pressable>`.
  * Passar rotas dinâmicas como objeto para garantir validação de *typed routes*:
    ```tsx
    <Link 
      href={{ pathname: '/ifpimons/[id]', params: { id: String(item.id) } }} 
      asChild
    >
      <Pressable style={styles.item}>
        <Text>{item.nome}</Text>
      </Pressable>
    </Link>
    ```
* **Navegação Pragmática (`router`)**:
  * Usar o objeto `router` (de `expo-router`) quando houver execução de lógica prévia (validação, requisição de API, verificação de permissão).
  * Métodos comuns: `router.push()`, `router.replace()`, `router.back()`, `router.canGoBack()`, `router.dismissTo()`.
  * Usar `router.replace()` para fluxos lineares onde não faz sentido retornar (ex: tela de Login para Home).

---

## TypeScript e Tipagem

* **Modo Estrito:** Manter `"strict": true` no `tsconfig.json`.
* **Props Explicitamente Tipadas:** Todo componente reutilizável deve definir um tipo para suas *props*:
  ```typescript
  type UserProfileProps = {
    nome: string;
    tipo: string;
    imagemUrl: string;
  };

  export const UserProfile = ({ nome, tipo, imagemUrl }: UserProfileProps) => { ... };
  ```
* **Estado Tipado:** Especificar o tipo no `useState` quando não puder ser inferido automaticamente:
  ```typescript
  const [contador, setContador] = useState<number>(0);
  const [usuario, setUsuario] = useState<User | null>(null);
  ```
* **Parâmetros de Rota:** Lembrar que valores retornados por `useLocalSearchParams` sempre chegam como `string` e devem ser convertidos explicitamente caso o valor original seja numérico (ex: `Number(id)`).

---

## Estilização com StyleSheet e Flexbox

### Regras do StyleSheet
* **`StyleSheet.create` ao Final:** Declarar as folhas de estilo no final do arquivo, após a definição do componente, mantendo a estrutura JSX visível primeiro.
* **Sem CSS Inline:** Evitar objetos de estilo *inline* diretamente na propriedade `style` do JSX.
* **Nomes semânticos baseados no PAPEL:** Nomear os estilos de acordo com a função do elemento na tela (`cartao`, `titulo`, `rodape`), **NUNCA** de acordo com a sua aparência visual (`caixaAzul`, `fonte20`).
* **Unidades de Medida:** Números em `StyleSheet` representam *pixels independentes de densidade* (`dp`), sem especificação de string como `px` ou `rem`.

### Layout com Flexbox
* **Eixo Padrão:** No React Native, o valor padrão de `flexDirection` é `'column'` (os elementos são empilhados na vertical).
* **Espaçamento Uniforme:** Dar preferência à propriedade `gap` (ou `rowGap`/`columnGap`) para espaçar elementos filhos em contêineres flex, em vez de aplicar `margin` individual em cada filho.
* **Ajuste Proporcional:** Usar `flex: 1` para contêineres principais ocuparem todo o espaço disponível na tela.

### Sombras Cross-Platform
Para garantir compatibilidade visual entre iOS e Android, declarar ambas as configurações de sombra no mesmo objeto de estilo:
```typescript
const styles = StyleSheet.create({
  cartao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    // Sombras para iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // Sombra para Android
    elevation: 3,
  },
});
```

### Elementos Clicáveis
* Usar o componente `<Pressable>` em vez do `<Button>` nativo para botões que exigem estilização customizada (o componente `<Button>` nativo não aceita a propriedade `style`).
* Utilizar a propriedade `style` em forma de função para dar feedback visual ao toque:
  ```tsx
  <Pressable
    style={({ pressed }) => [
      styles.botao,
      pressed && styles.botaoPressionado,
    ]}
    onPress={handlePress}
  >
    <Text style={styles.textoBotao}>Enviar</Text>
  </Pressable>
  ```
* Usar `hitSlop` para expandir a área de toque visualmente pequena sem alterar a caixa do componente (alvo mínimo acessível de 24x24 dp).

---