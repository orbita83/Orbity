import { createAppContainer } from "@/di/container";
import { InMemoryProfileRepository } from "@/infra/repositories/in-memory-profile-repository";
import { createStudentProfileFixture } from "@/model/__fixtures__/student-profile.fixture";
import type { StudentProfile } from "@/model/entities/student-profile";
import type { IProfileRepository } from "@/model/repositories/profile-repository";
import { ProfileUseCases } from "./profile-use-cases";

describe("Normalização das métricas do perfil", () => {
  it("normaliza métricas inválidas recebidas somente após salvar o nome", async () => {
    const initial = createStudentProfileFixture();
    const saved = createStudentProfileFixture({
      name: "Ana",
      streakDays: NaN,
      achievementsCount: -3,
      studyHours: Infinity,
    });
    const repository: IProfileRepository = {
      getProfile: async () => initial,
      updateName: jest.fn(async () => saved),
    };
    const useCases = new ProfileUseCases(repository);

    expect(await useCases.getProfile()).toEqual(initial);
    const updated = await useCases.updateName("  Ana  ");

    expect(repository.updateName).toHaveBeenCalledWith("Ana");
    expect(updated).toEqual({ ...saved, streakDays: 0, achievementsCount: 0, studyHours: 0 });
    expect(updated).not.toBe(saved);
    expect(saved.streakDays).toBeNaN();
    expect(saved.achievementsCount).toBe(-3);
    expect(saved.studyHours).toBe(Infinity);
    expect(initial.name).toBe("Alex Silva");
  });

  it.each(["streakDays", "achievementsCount", "studyHours"] as const)("normaliza %s sem modificar os demais campos", async (field) => {
    for (const [input, expected] of [[12.9, 12], [0, 0], [-1, 0], [0.9, 0], [NaN, 0], [Infinity, 0], [-Infinity, 0], ["12", 0], [null, 0], [undefined, 0]] as const) {
      const original = createStudentProfileFixture({ [field]: input } as unknown as Partial<StudentProfile>);
      const repository = { getProfile: async () => original, updateName: async () => original };
      const useCases = new ProfileUseCases(repository);
      const result = await useCases.getProfile();
      expect(result).toEqual({ ...original, [field]: expected });
      expect(result).not.toBe(original);
      expect(original[field]).toBe(input);
      expect(await useCases.updateName("Ana")).toEqual(result);
    }
  });

  it("compõe consulta e edição com o mesmo repositório sem persistir a normalização", async () => {
    const initial = createStudentProfileFixture({ studyHours: 42.8, streakDays: -2 });
    const repository = new InMemoryProfileRepository(initial);
    const { useCases } = createAppContainer({ repositories: { profile: repository } });
    expect(await useCases.profile.getProfile()).toEqual({ ...initial, studyHours: 42, streakDays: 0 });
    expect(await repository.getProfile()).toEqual(initial);
    expect(await useCases.profile.updateName("Ana")).toEqual({ ...initial, name: "Ana", studyHours: 42, streakDays: 0 });
    expect((await repository.getProfile()).studyHours).toBe(42.8);
  });
});
