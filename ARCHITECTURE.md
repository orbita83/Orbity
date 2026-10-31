##@ARCHITECTURE

# Guia Completo: MVVM Sofisticado (Capítulo 10)

> **Fonte:** *Tutoriais de PDM: Desenvolvimento Mobile com React Native e Expo*  
> **Capítulo 10:** *MVVM Sofisticado com React Native, TypeScript e Expo* (pp. 127–143)

---

## 1. Visão Geral e Evolução

O **MVVM Sofisticado** evolui o padrão simplificado (vista no Capítulo 8) incorporando princípios fundamentais da Engenharia de Software, como **Clean Architecture**, **Inversão de Dependências (DIP)** e **Testabilidade Unitária**.

### Diferenças Principais: MVVM Simplificado vs. Sofisticado

| Aspecto | MVVM Simplificado (Cap. 8) | MVVM Sofisticado (Cap. 10) |
| :--- | :--- | :--- |
| **ViewModel** | Concentra estado da tela + chamadas diretas a serviços. | Gerencia **apenas o estado da tela**; delega toda lógica aos *Use Cases*. |
| **Regras de Negócio** | Misturadas na ViewModel ou no Serviço. | Isoladas exclusivamente na camada de **Use Cases**. |
| **Model** | Continha entidades e serviços concretos. | Contém **apenas entidades puras e interfaces (contratos)**. |
| **Acesso a Dados** | Direto nos serviços/repositórios dentro do Model. | Isolado na camada de **Infraestrutura** (*Firebase, SQLite, REST, Memory*). |
| **Dependências** | Classes concretas importadas diretamente. | **Inversão de Dependência (DIP)** via interfaces e Container de Injeção (*DI*). |

---

## 2. As 5 Camadas do MVVM Sofisticado

```
View  -->  ViewModel  -->  Use Cases  -->  Domínio (Model)  <--  Infraestrutura
```

1. **View (Interface):** Componentes e telas React Native. Responsável apenas por renderizar estado e disparar ações (*fire-and-forget*). Não possui blocos `try/catch` nem regras de negócio.
2. **ViewModel (Apresentação):** Custom Hooks que gerenciam estado de interface (`loading`, `error`, `data`) e expõem funções de ação. Depende **apenas de abstrações** (interfaces de Use Cases).
3. **Use Cases (Casos de Uso / Orquestração):** Regras de negócio puras e validações do sistema (ex: `AuthUseCases`). Orquestram repositórios e serviços através de interfaces.
4. **Domínio / Model (Core do Negócio):** Entidades puras (`User.ts`), interfaces de serviços (`IAuthService.ts`), interfaces de repositórios (`IUserRepository.ts`) e interfaces de Use Cases. **Zero dependência de bibliotecas externas** (React, Expo, Firebase).
5. **Infraestrutura:**
   Implementa:
   - **Services concretos** (ex.: `MemoryAuthService` e `FirebaseAuthService`);
   - **DataSources concretos** (ex.: `MemoryUserDataSource` e `FirestoreUserDataSource`);
   - **Mapeamentos** para converter dados externos em entidades do domínio.

   > **Regra de Ouro da Infraestrutura:** A Infra nunca propaga erros específicos. Sempre converte para erros puros definidos no domínio.

   > **Nota — DataSource, Service e Use Case:**
   > - **DataSource / Repository (Infra):** Lida com persistência e busca de dados brutos (memória, banco local, Firestore, API) e os mapeia para entidades do domínio.
   > - **Service (Infra):** Lida com integrações e capacidades externas (autenticação, notificações, sensores, câmera).
   > - **Use Case:** Coordena e aplica as regras de negócio sobre as interfaces de `Service` e `Repository`/`DataSource`, sem saber qual tecnologia concreta está por baixo.

---

## 3. Estrutura de Pastas Recomendada

```
└── src/
    ├── app/                  # Módulos de rota do Expo Router
    │   ├── _layout.tsx
    │   └── index.tsx
    ├── infra/                # Implementações concretas (Infraestrutura)
    │   ├── repositories/     # (ou dataSource/) Ex: MemoryUserDataSource.ts, FirestoreUserDataSource.ts
    │   └── services/         # Ex: MemoryAuthService.ts, FirebaseAuthService.ts
    ├── model/                # Camada de Domínio Puro (Model)
    │   ├── entities/         # Ex: User.ts
    │   ├── repositories/     # Ex: IUserRepository.ts (Interface)
    │   └── services/         # Ex: IAuthService.ts (Interface)
    ├── usecase/              # (ou usecases/) Casos de Uso
    │   ├── IAuthUseCases.ts  # Contrato/Interface do Use Case
    │   └── AuthUseCases.ts   # Implementação do Use Case
    ├── view/                 # Componentes de tela (*-screen.tsx / *View.tsx) e UI
    ├── viewmodel/            # Custom Hooks da ViewModel (ex: useLoginViewModel.ts)
    └── DI/                   # Container de Injeção de Dependências (container.ts)
```

---

## 4. Código do Fluxo Completo de Autenticação

### Step 1: Domínio / Model — Entidade Pura (`src/model/entities/User.ts`)
```typescript
export default interface User {
  uID: string;
  userName: string;
}
```

### Step 2: Domínio / Model — Interfaces (`src/model/services/IAuthService.ts` e `IUserRepository.ts`)
```typescript
import User from "../entities/User";

export interface IAuthService {
  login(userName: string, password: string): Promise<User>;
  signup(userName: string, password: string): Promise<User>;
  logout(): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): void;
}

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}
```

### Step 3: Camada de Use Cases (`src/usecase/AuthUseCases.ts`)
```typescript
import User from "../model/entities/User";
import { IAuthService } from "../model/services/IAuthService";
import { IAuthUseCases } from "./IAuthUseCases";
import { ValidationError } from "../model/errors/ValidationError";

export class AuthUseCases implements IAuthUseCases {
  constructor(private authService: IAuthService) {}

  async login(userName: string, password: string): Promise<User> {
    AuthValidator.validateLogin(userName, password);
    return this.authService.login(userName, password);
  }

  async signup(userName: string, password: string): Promise<User> {
    AuthValidator.validateSignup(userName, password);
    return this.authService.signup(userName, password);
  }

  async logout(): Promise<void> {
    return this.authService.logout();
  }

  onAuthStateChanged(callback: (user: User | null) => void): void {
    this.authService.onAuthStateChanged(callback);
  }
}

class AuthValidator {
  static validateLogin(userName: string, password: string): void {
    if (!userName) throw new ValidationError("Nome de usuário é obrigatório.");
    if (!password) throw new ValidationError("Senha é obrigatória.");
  }

  static validateSignup(userName: string, password: string): void {
    if (!userName) throw new ValidationError("Nome de usuário é obrigatório.");
    if (!password) throw new ValidationError("Senha é obrigatória.");
  }
}
```

### Step 4: Camada de Infraestrutura (`src/infra/services/FirebaseAuthService.ts`)
```typescript
import { IAuthService } from "../../model/services/IAuthService";
import User from "../../model/entities/User";

export class FirebaseAuthService implements IAuthService {
  async login(email: string, password: string): Promise<User> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulação
      if (email !== "user@example.com" || password !== "password") {
        throw new Error("FirebaseAuthError");
      }
      return { uID: "123", userName: "user123" };
    } catch (err) {
      // A Infra nunca propaga erros específicos: converte para erro puro do domínio
      throw new Error("Credenciais inválidas.");
    }
  }

  async signup(email: string, password: string): Promise<User> {
    return { uID: "124", userName: email };
  }

  async logout(): Promise<void> {}

  onAuthStateChanged(callback: (user: User | null) => void): void {}
}
```

### Step 5: Container de Injeção de Dependências (`src/DI/container.ts`)
```typescript
import { FirebaseAuthService } from "../infra/services/FirebaseAuthService";
import { AuthUseCases } from "../usecase/AuthUseCases";
import { IAuthUseCases } from "../usecase/IAuthUseCases";

// 1. Instanciação dos Services / DataSources concretos da Infra
export const authService = new FirebaseAuthService();

// 2. Instanciação dos Use Cases injetando as dependências
export const authUseCases: IAuthUseCases = new AuthUseCases(authService);
```

### Step 6: ViewModel (`src/viewmodel/useLoginViewModel.ts`)
```typescript
import { useState } from "react";
import { authUseCases as defaultAuthUseCases } from "../DI/container";
import { IAuthUseCases } from "../usecase/IAuthUseCases";

export type LoginState = {
  userId: string | null;
  loading: boolean;
  error: string | null;
};

export type LoginActions = {
  handleLogin: (email: string, password: string) => Promise<void>;
};

export function useLoginViewModel(
  authUseCases: IAuthUseCases = defaultAuthUseCases
): LoginState & LoginActions {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const user = await authUseCases.login(email, password);
      setUserId(user.uID);
    } catch (err: any) {
      setError(err.message ?? "Falha inesperada no login.");
    } finally {
      setLoading(false);
    }
  }

  return { userId, loading, error, handleLogin };
}
```

### Step 7: View (`src/view/login-screen.tsx`) e Módulo de Rota (`src/app/login-screen.tsx`)
```typescript
// 1. Componente de Tela na View (src/view/login-screen.tsx)
import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useLoginViewModel } from "../viewmodel/useLoginViewModel";

const LoginScreen = () => {
  const vm = useLoginViewModel();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (vm.userId) {
      router.replace("/home");
    }
  }, [vm.userId]);

  if (vm.loading) {
    return <Text style={styles.center}>Carregando...</Text>;
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title="Entrar"
        onPress={() => vm.handleLogin(email, password)}
      />
      {vm.error && <Text style={styles.error}>{vm.error}</Text>}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, justifyContent: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12 },
  error: { color: "red", marginTop: 8 },
  center: { textAlign: "center", marginTop: 40 }
});
```

```typescript
// 2. Módulo de Rota no App (src/app/login-screen.tsx)
import LoginScreen from "../view/login-screen";

export default LoginScreen;
```

---

## 5. Tratamento de Erros e Testabilidade

1. **Tratamento de Erros em Camadas:**
   - **Infra:** Captura erros de bibliotecas/APIs e os re-lança como erros puros definidos no domínio. **A Infra nunca propaga erros específicos.**
   - **Use Case:** Aplica validações de regra de negócio (`ValidationError`).
   - **ViewModel:** Mapeia exceções recebidas em mensagens amigáveis de estado (`error`).
   - **View:** Apenas lê a string `vm.error` e exibe na tela. **A View nunca faz `try/catch`.**

2. **Testabilidade sem React Native:**
   - Como os **Use Cases** e a **ViewModel** dependem apenas de interfaces (`IAuthService`, `IAuthUseCases`), você pode criar *mocks* simples para testar regras de negócio sem precisar de simuladores, banco de dados ou ambiente React Native:

```typescript
// Exemplo de Test Double (Mock) para teste unitário
const mockAuthService: IAuthService = {
  login: async () => ({ uID: "99", userName: "teste" }),
  signup: async () => ({ uID: "99", userName: "teste" }),
  logout: async () => {},
  onAuthStateChanged: () => {}
};

const useCaseTest = new AuthUseCases(mockAuthService);
// Pode ser testado diretamente via Jest ou Bun/Node!
```
