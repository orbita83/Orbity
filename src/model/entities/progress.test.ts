import { createProgress } from "@/model/entities/progress";
import { ValidationError } from "@/model/errors";

describe("createProgress", () => {
  it("RN-0007: sem atividades, mostra 0/0 sem proporção", () => {
    expect(createProgress(0, 0)).toEqual({ completed: 0, total: 0, ratio: null });
  });

  it("RN-0007: calcula a proporção sobre o total geral", () => {
    expect(createProgress(3, 30)).toEqual({ completed: 3, total: 30, ratio: 0.1 });
  });

  it.each([
    [-1, 0],
    [4, 3],
    [1.5, 3],
  ])("rejeita concluídas=%p e total=%p", (completed, total) => {
    expect(() => createProgress(completed, total)).toThrow(ValidationError);
  });
});
