import { createAppContainer } from "@/di/container";
import { MemoryProfileDataSource } from "@/infra/datasources/memoryProfileDataSource";
import { createStudentProfileFixture } from "@/model/__fixtures__/studentProfile.fixture";
import type { StudentProfile } from "@/model/entities/studentProfile";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import { ProfileUseCases } from "./profileUseCases";

describe("Normalização das métricas do perfil", () => {
  it("normaliza métricas inválidas recebidas somente após salvar o nome", async () => {
    const initial = createStudentProfileFixture();
    const saved = createStudentProfileFixture({
      name: "Ana",
      streakDays: NaN,
      achievementsCount: -3,
      studyHours: Infinity,
    });
    const dataSource: IProfileDataSource = {
      getProfile: async () => initial,
      updateName: jest.fn(async () => saved),
    };
    const useCases = new ProfileUseCases(dataSource);

    expect(await useCases.getProfile()).toEqual(initial);
    const updated = await useCases.updateName("  Ana  ");

    expect(dataSource.updateName).toHaveBeenCalledWith("Ana");
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
      const dataSource = { getProfile: async () => original, updateName: async () => original };
      const useCases = new ProfileUseCases(dataSource);
      const result = await useCases.getProfile();
      expect(result).toEqual({ ...original, [field]: expected });
      expect(result).not.toBe(original);
      expect(original[field]).toBe(input);
      expect(await useCases.updateName("Ana")).toEqual(result);
    }
  });

  it("compõe consulta e edição com o mesmo DataSource sem persistir a normalização", async () => {
    const initial = createStudentProfileFixture({ studyHours: 42.8, streakDays: -2 });
    const dataSource = new MemoryProfileDataSource(initial);
    const { useCases } = createAppContainer({ dataSources: { profile: dataSource } });
    expect(await useCases.profile.getProfile()).toEqual({ ...initial, studyHours: 42, streakDays: 0 });
    expect(await dataSource.getProfile()).toEqual(initial);
    expect(await useCases.profile.updateName("Ana")).toEqual({ ...initial, name: "Ana", studyHours: 42, streakDays: 0 });
    expect((await dataSource.getProfile()).studyHours).toBe(42.8);
  });
});
