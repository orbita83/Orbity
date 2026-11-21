const { describe, expect, jest, test } = require("@jest/globals");
const {
  AUTOMATION_LOGIN,
  computeLabels,
  globToRegExp,
  labelHistory,
  managedLabels,
  planLabelChanges,
  syncPullRequestLabels,
} = require("../scripts/pr-labels.cjs");
const config = require("../.github/pr-labels.json");

function labelsFor(pullRequest) {
  return computeLabels({ branch: "", base: "development", files: [], ...pullRequest }, config)
    .map(({ label }) => label)
    .sort();
}

function labelEvent(event, label, actor) {
  return { event, label: { name: label }, actor: { login: actor } };
}

describe("globToRegExp", () => {
  test("separa * de ** e de arquivos da raiz", () => {
    expect(globToRegExp("*.md").test("README.md")).toBe(true);
    expect(globToRegExp("*.md").test("docs/guia.md")).toBe(false);
    expect(globToRegExp("src/view/**").test("src/view/components/Card.tsx")).toBe(true);
    expect(globToRegExp("**/*.stories.tsx").test("src/view/components/Card.stories.tsx")).toBe(true);
    expect(globToRegExp("**/*.stories.tsx").test("Card.stories.tsx")).toBe(true);
  });
});

describe("computeLabels", () => {
  test("feat em src/view e tests recebe feature, ui e test", () => {
    expect(
      labelsFor({
        title: "feat(tasks): mostra a categoria como tag",
        files: ["src/view/tasks.tsx", "src/viewmodel/useTasksViewModel.ts", "tests/tasks.test.tsx"],
      }),
    ).toEqual(["feature", "test", "ui"]);
  });

  test("docs só no design-system recebe docs e design, sem ui", () => {
    expect(
      labelsFor({ title: "docs(design-system): prepara o ods 1.3.0", files: ["design-system/02-tokens.md"] }),
    ).toEqual(["design", "docs"]);
  });

  test("usa o prefixo da branch quando o título não segue o padrão", () => {
    expect(labelsFor({ title: "Ajustes gerais", branch: "refactor/nomes", files: ["src/model/task.ts"] })).toEqual([
      "refactor",
    ]);
  });

  test("não aplica label de tipo sem prefixo reconhecido", () => {
    expect(labelsFor({ title: "release: publicar versão 1.2.0", branch: "development", base: "main" })).toEqual([
      "production",
    ]);
  });

  test("PR para main recebe production e nenhuma label de área", () => {
    expect(
      labelsFor({
        title: "feat(perfil): adiciona a tela perfil",
        base: "main",
        files: ["src/view/profile.tsx", "design-system/02-tokens.md"],
      }),
    ).toEqual(["feature", "production"]);
  });

  test("tema conta como design e não como ui; stories não contam como ui", () => {
    expect(
      labelsFor({
        title: "fix(theme): corrige contraste",
        files: ["src/view/theme/tokens.ts", "src/view/components/Card.stories.tsx"],
      }),
    ).toEqual(["design", "fix"]);
  });

  test("test de área exige código de src além dos testes", () => {
    expect(labelsFor({ title: "chore(ci): ajusta testes", files: ["tests/pure-logic.test.ts"] })).toEqual(["chore"]);
    expect(
      labelsFor({ title: "fix(tasks): corrige data", files: ["src/model/task.test.ts", "src/model/task.ts"] }),
    ).toEqual(["fix", "test"]);
  });

  test("docs de área não duplica PR do tipo docs e cobre markdown da raiz", () => {
    expect(labelsFor({ title: "fix(app): corrige rota", files: ["src/app/tasks.tsx", "CONTRIBUTING.md"] })).toEqual([
      "docs",
      "fix",
    ]);
  });

  test("ci e cd vêm de workflows e do eas", () => {
    expect(
      labelsFor({ title: "chore(ci): adiciona build", files: [".github/workflows/eas-build.yml", "eas.json"] }),
    ).toEqual(["cd", "chore", "ci"]);
  });

  test("ignora arquivos gerados e de lock", () => {
    expect(labelsFor({ title: "chore(deps): atualiza", files: ["package-lock.json", "storybook-static/index.md"] })).toEqual([
      "chore",
    ]);
  });

  test("informa a regra que gerou cada label", () => {
    const [type, area] = computeLabels(
      { title: "fix(ci): ajusta", branch: "fix/ci", base: "development", files: [".husky/pre-push"] },
      config,
    );
    expect(type.reason).toContain("título");
    expect(area.reason).toContain(".husky/pre-push");
  });
});

describe("labelHistory e planLabelChanges", () => {
  const managed = managedLabels(config);

  test("troca a label de tipo aplicada pela automação quando o título muda", () => {
    const { owned, removedByPerson } = labelHistory([labelEvent("labeled", "fix", AUTOMATION_LOGIN)]);
    expect(
      planLabelChanges({ current: ["fix"], desired: ["refactor"], owned, removedByPerson, managed }),
    ).toEqual({ add: ["refactor"], remove: ["fix"] });
  });

  test("nunca remove labels adicionadas manualmente", () => {
    const { owned, removedByPerson } = labelHistory([
      labelEvent("labeled", "ui", "pessoa"),
      labelEvent("labeled", "accessibility", "pessoa"),
    ]);
    expect(
      planLabelChanges({ current: ["ui", "accessibility"], desired: ["feature"], owned, removedByPerson, managed }),
    ).toEqual({ add: ["feature"], remove: [] });
  });

  test("não reaplica uma label que uma pessoa removeu", () => {
    const { owned, removedByPerson } = labelHistory([
      labelEvent("labeled", "ui", AUTOMATION_LOGIN),
      labelEvent("unlabeled", "ui", "pessoa"),
    ]);
    expect(planLabelChanges({ current: [], desired: ["ui"], owned, removedByPerson, managed })).toEqual({
      add: [],
      remove: [],
    });
  });

  test("uma label reaplicada por uma pessoa deixa de pertencer à automação", () => {
    const { owned } = labelHistory([
      labelEvent("labeled", "docs", AUTOMATION_LOGIN),
      labelEvent("unlabeled", "docs", "pessoa"),
      labelEvent("labeled", "docs", "pessoa"),
    ]);
    expect(owned.has("docs")).toBe(false);
  });
});

describe("syncPullRequestLabels", () => {
  test("lê o PR pela API e aplica só as mudanças necessárias", async () => {
    const pages = {
      listFiles: [{ filename: "src/view/tasks.tsx" }],
      listEvents: [labelEvent("labeled", "fix", AUTOMATION_LOGIN)],
    };
    const github = {
      rest: {
        pulls: { listFiles: "listFiles" },
        issues: { listEvents: "listEvents", addLabels: jest.fn(), removeLabel: jest.fn() },
      },
      paginate: async (endpoint) => pages[endpoint],
    };
    const context = {
      repo: { owner: "orbita83", repo: "Orbity" },
      payload: {
        pull_request: {
          number: 7,
          title: "refactor(view): reorganiza a tela",
          head: { ref: "refactor/tela" },
          base: { ref: "development" },
          labels: [{ name: "fix" }],
        },
      },
    };
    const core = { info: jest.fn() };

    await syncPullRequestLabels({ github, context, core, config });

    expect(github.rest.issues.addLabels).toHaveBeenCalledWith({
      owner: "orbita83",
      repo: "Orbity",
      issue_number: 7,
      labels: ["refactor", "ui"],
    });
    expect(github.rest.issues.removeLabel).toHaveBeenCalledWith({
      owner: "orbita83",
      repo: "Orbity",
      issue_number: 7,
      name: "fix",
    });
  });
});
