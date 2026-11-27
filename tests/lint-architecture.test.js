const { mkdirSync, mkdtempSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { expect, test } = require("@jest/globals");
const { lintArchitecture } = require("../scripts/lint-architecture.cjs");

const modules = {
  "src/app/(student)/[id].tsx": 'export { default } from "@/view/(student)/[id]";',
  "src/view/(student)/[id].tsx": "const TaskScreen = () => null; export default TaskScreen;",
  "src/model/entities/task.ts": "export type Task = { title: string };",
  "src/model/errors.ts": "export class DomainError extends Error {}",
  "src/model/services/iClockService.ts": "export interface IClockService { now(): string; }",
  "src/usecase/taskUseCases.ts": `
    import type { IClockService } from "@/model/services/iClockService";
    export interface ITaskUseCases { getTitle(): string; }
    export class TaskUseCases implements ITaskUseCases {
      constructor(private clock: IClockService) {}
      getTitle() { return this.clock.now(); }
    }
  `,
  "src/di/container.ts": `
    import { TaskUseCases } from "@/usecase/taskUseCases";
    const services = { clock: { now: () => "" } };
    export const container = { services, useCases: { tasks: new TaskUseCases(services.clock) } };
  `,
  "src/viewmodel/useTaskViewModel.ts": `
    import { container as dependencies } from "@/di/container";
    import { type ITaskUseCases } from "@/usecase/taskUseCases";
    import { DomainError } from "@/model/errors";
    import { router } from "expo-router";
    export type TaskState = { title: string };
    export type TaskActions = { refresh: () => void };
    export function useTaskViewModel(tasks: ITaskUseCases = dependencies["useCases"].tasks): [TaskState, TaskActions] {
      return [{ title: tasks.getTitle() }, { refresh: () => router.back() }];
    }
  `,
  "src/view/components/TaskCard.tsx": `
    import type { Task } from "@/model/entities/task";
    export const TaskCard = (_props: Task) => null;
  `,
  "src/usecase/taskUseCases.test.ts": 'import { TaskUseCases } from "./taskUseCases";',
  "src/model/__fixtures__/task.fixture.ts": 'export const task = { title: "" };',
};

function lintFixture(overrides = {}) {
  const rootDir = mkdtempSync(path.join(tmpdir(), "orbity-architecture-"));
  try {
    const config = {
      compilerOptions: {
        paths: { "@/*": ["./src/*"], "@model/*": ["./src/model/*"] },
        jsx: "preserve",
        types: [],
      },
    };
    writeFileSync(path.join(rootDir, "tsconfig.json"), JSON.stringify(config));
    for (const [file, contents] of Object.entries({ ...modules, ...overrides })) {
      const target = path.join(rootDir, file);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, contents);
    }
    return lintArchitecture({ rootDir });
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
}

test("aceita a composição por contratos, navegação na ViewModel e rota espelhada em grupo", () => {
  expect(lintFixture()).toEqual({ ok: true, violations: [], checkedFiles: Object.keys(modules).length });
});

test("rejeita dependências proibidas mesmo com alias, re-exportação e imports sem binding", () => {
  const { violations } = lintFixture({
    "src/viewmodel/reference.ts": `
      import { container as deps } from "@/di/container";
      import type { TaskUseCases } from "@/usecase/taskUseCases";
      import type { IClockService } from "@model/services/iClockService";
      export const clock = deps["services"].clock;
      export const { services } = deps;
      export const references = { deps };
    `,
    "src/view/components/TaskCard.tsx": `
      import { router } from "expo-router";
      import { DomainError } from "@model/errors";
      export type { ITaskUseCases } from "@/usecase/taskUseCases";
      try { router.back(); } catch {}
      export default () => null;
    `,
    "src/model/entities/task.ts": `
      export type Task = import("@/di/container").Container;
      export const task = require("react");
    `,
    "src/infra/dataSource.ts": `
      import "@/model/__fixtures__/task.fixture";
      import("expo-sqlite/next", { with: {} });
      import("expo-notifications");
    `,
    "src/usecase/internal.ts": 'export { TaskUseCases } from "@/usecase/taskUseCases";',
  });

  const rulesByFile = Object.groupBy(violations, ({ file }) => file);
  const rules = (file) => rulesByFile[file].map(({ ruleId }) => ruleId);
  expect(rules("src/viewmodel/reference.ts")).toEqual(["ARCH-002", "ARCH-001", "ARCH-002", "ARCH-002", "ARCH-002"]);
  expect(rules("src/view/components/TaskCard.tsx")).toEqual(["ARCH-001", "ARCH-001", "ARCH-001", "ARCH-005", "ARCH-007"]);
  expect(rules("src/model/entities/task.ts")).toEqual(["ARCH-001", "ARCH-001"]);
  expect(rules("src/infra/dataSource.ts")).toEqual(["ARCH-004", "ARCH-001", "ARCH-001"]);
  expect(rules("src/usecase/internal.ts")).toEqual(["ARCH-002"]);
});

test("issue #189: aceita módulo *InputValidation importado por um Use Case", () => {
  const overrides = {
    "src/usecase/taskInputValidation.ts": `
      import { DomainError } from "@/model/errors";
      export type TaskInput = { title: string };
      const MAX_TITLE = 60;
      const MIN_TITLE = -1;
      const DATE_PATTERN = /^(\\d{2})\\/(\\d{2})$/i;
      const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
      const LIMITS = Object.freeze({ title: 60, tags: Object.freeze(["a", "b"]) });
      const MESSAGES = { empty: "Vazio.", long: \`Longo.\` } as const satisfies Record<string, string>;
      const isBlank = (value: string) => value.trim() === "";
      export function validateTitle(input: TaskInput): string {
        if (input.title.length > MAX_TITLE) throw new DomainError("Título longo.");
        return input.title.trim();
      }
    `,
    "src/usecase/routineUseCases.ts": `
      import { validateTitle } from "@/usecase/taskInputValidation";
      export interface IRoutineUseCases { title(value: string): string; }
      export class RoutineUseCases implements IRoutineUseCases {
        title(value: string) { return validateTitle({ title: value }); }
      }
    `,
  };
  expect(lintFixture(overrides)).toEqual({
    ok: true,
    violations: [],
    checkedFiles: Object.keys({ ...modules, ...overrides }).length,
  });
});

test("issue #189: continua recusando a classe concreta de outro Use Case e o módulo auxiliar fora de usecase/", () => {
  const { violations } = lintFixture({
    "src/usecase/taskInputValidation.ts": `
      let calls = 0;
      const seen: string[] = [];
      const cache = { last: "" };
      const ids = new Set<string>();
      const GLOBAL_PATTERN = /a/g;
      const STICKY_PATTERN = /a/y;
      const mixed = Object.freeze({ items: [] as string[] });
      export class TaskValidator {}
      export function validateTitle(title: string): string { calls += 1; return title.trim(); }
    `,
    "src/usecase/routineUseCases.ts": `
      import { TaskUseCases } from "@/usecase/taskUseCases";
      export interface IRoutineUseCases { title(): string; }
      export class RoutineUseCases implements IRoutineUseCases {
        constructor(private tasks: TaskUseCases) {}
        title() { return this.tasks.getTitle(); }
      }
    `,
    "src/usecase/routineHelpers.ts": 'export { TaskUseCases } from "@/usecase/taskUseCases";',
    "src/viewmodel/useRoutineViewModel.ts": `
      import { validateTitle } from "@/usecase/taskInputValidation";
      export type RoutineState = { title: string };
      export type RoutineActions = { rename: () => void };
      export function useRoutineViewModel(): [RoutineState, RoutineActions] {
        return [{ title: validateTitle("") }, { rename: () => {} }];
      }
    `,
  });

  const rulesByFile = Object.groupBy(violations, ({ file }) => file);
  const rules = (file) => (rulesByFile[file] ?? []).map(({ ruleId }) => ruleId);
  expect(rules("src/usecase/routineUseCases.ts")).toEqual(["ARCH-002"]);
  expect(rules("src/usecase/routineHelpers.ts")).toEqual(["ARCH-002"]);
  expect(rules("src/viewmodel/useRoutineViewModel.ts")).toEqual(["ARCH-002"]);
  // let, os seis const mutáveis (array, objeto, Set, regex g/y, array dentro do freeze) e a classe.
  expect(rules("src/usecase/taskInputValidation.ts")).toEqual(Array(8).fill("ARCH-002"));
});

test("rejeita rota que exporta outro valor, contrato com implementação e ViewModel sem tupla", () => {
  const { violations } = lintFixture({
    "src/app/(student)/[id].tsx": 'import Screen from "@/view/(student)/[id]"; export default () => null;',
    "src/model/datasources/iTaskDataSource.ts": "export class TaskDataSource {}",
    "src/viewmodel/useTaskViewModel.ts": "export const useTaskViewModel = () => ({ title: '' });",
    "src/viewmodel/useOtherViewModel.ts": `
      export type OtherState = { loading: boolean };
      export type OtherActions = { retry: () => void };
      export const useOtherViewModel = (): [OtherActions, OtherState] => [
        { retry: () => {} }, { loading: false },
      ];
    `,
  });
  expect(violations.map(({ ruleId }) => ruleId)).toEqual(["ARCH-006", "ARCH-003", "ARCH-008", "ARCH-008"]);
});

test("issue #221: aceita variante por plataforma do componente e o Skia na view", () => {
  const overrides = {
    "src/view/components/Planet.tsx": 'import { Canvas } from "@shopify/react-native-skia"; export const Planet = () => Canvas;',
    "src/view/components/Planet.web.tsx": 'import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web"; export const Planet = () => WithSkiaWeb;',
  };
  expect(lintFixture(overrides)).toEqual({ ok: true, violations: [], checkedFiles: Object.keys(modules).length + 2 });
});
