import { mockStudentProfile } from "@/model/__fixtures__/student-profile.fixture";
import { InMemoryProfileRepository } from "./in-memory-profile-repository";

describe("InMemoryProfileRepository", () => {
  it("deve carregar os dados iniciais padrão quando nenhum perfil inicial for passado", async () => {
    // Arrange
    const repository = new InMemoryProfileRepository();

    // Act
    const profile = await repository.getProfile();

    // Assert
    expect(profile).toEqual(mockStudentProfile);
  });

  it("deve carregar o perfil inicial customizado fornecido no construtor", async () => {
    // Arrange
    const customInitial = {
      id: "student-custom",
      name: "Camila Santos",
      streakDays: 3,
      achievementsCount: 1,
      studyHours: 8,
    };
    const repository = new InMemoryProfileRepository(customInitial);

    // Act
    const profile = await repository.getProfile();

    // Assert
    expect(profile).toEqual(customInitial);
  });

  it("deve atualizar o nome e persistir a alteração para chamadas subsequentes", async () => {
    // Arrange
    const repository = new InMemoryProfileRepository();

    // Act
    const updated = await repository.updateName("Lucas Mendes");
    const retrieved = await repository.getProfile();

    // Assert
    expect(updated.name).toBe("Lucas Mendes");
    expect(retrieved.name).toBe("Lucas Mendes");
    expect(retrieved.id).toBe(mockStudentProfile.id);
  });

  it("deve manter isolamento de dados entre instâncias distintas", async () => {
    // Arrange
    const repository1 = new InMemoryProfileRepository();
    const repository2 = new InMemoryProfileRepository();

    // Act
    await repository1.updateName("Nome Modificado");

    // Assert
    const profile1 = await repository1.getProfile();
    const profile2 = await repository2.getProfile();

    expect(profile1.name).toBe("Nome Modificado");
    expect(profile2.name).toBe(mockStudentProfile.name);
  });
});
