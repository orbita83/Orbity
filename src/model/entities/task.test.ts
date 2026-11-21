import { createTaskFixture } from "@/model/__fixtures__/task.fixture";
import { TASK_CATEGORY_IDS, filterAndSortTasks, isTaskCategoryId } from "@/model/entities/task";

describe("Entidade Task", () => {
  describe("filterAndSortTasks", () => {
    it("filtra por status e mantém fixadas no topo preservando ordem relativa", () => {
      const a = createTaskFixture({ id: "a", completed: false, pinned: false });
      const b = createTaskFixture({ id: "b", completed: true, pinned: false });
      const c = createTaskFixture({ id: "c", completed: false, pinned: true });

      expect(filterAndSortTasks([a, b, c], "all").map((item) => item.id)).toEqual(["c", "a", "b"]);
      expect(filterAndSortTasks([a, b, c], "pending").map((item) => item.id)).toEqual(["c", "a"]);
      expect(filterAndSortTasks([a, b, c], "completed").map((item) => item.id)).toEqual(["b"]);
    });
  });

  describe("categorias (tarefas.md, T3)", () => {
    it("reconhece só os ids de categoria do domínio", () => {
      expect(TASK_CATEGORY_IDS).toEqual(["mathematics", "reading", "languages", "science", "programming", "music"]);
      expect(isTaskCategoryId("programming")).toBe(true);
      expect(isTaskCategoryId("programacao")).toBe(false);
      expect(isTaskCategoryId("code")).toBe(false);
    });
  });
});
