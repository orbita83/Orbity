import { mockStudentProfile } from "@/model/__fixtures__/studentProfile.fixture";
import { MemoryProfileDataSource } from "./memoryProfileDataSource";

describe("MemoryProfileDataSource", () => {
  it("deve carregar os dados iniciais padrão quando nenhum perfil inicial for passado", async () => {
    // Arrange
    const dataSource = new MemoryProfileDataSource();

    // Act
    const profile = await dataSource.getProfile();

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
    const dataSource = new MemoryProfileDataSource(customInitial);

    // Act
    const profile = await dataSource.getProfile();

    // Assert
    expect(profile).toEqual(customInitial);
  });

  it("deve atualizar o nome e persistir a alteração para chamadas subsequentes", async () => {
    // Arrange
    const dataSource = new MemoryProfileDataSource();

    // Act
    const updated = await dataSource.updateName("Lucas Mendes");
    const retrieved = await dataSource.getProfile();

    // Assert
    expect(updated.name).toBe("Lucas Mendes");
    expect(retrieved.name).toBe("Lucas Mendes");
    expect(retrieved.id).toBe(mockStudentProfile.id);
  });

  it("deve manter isolamento de dados entre instâncias distintas", async () => {
    // Arrange
    const dataSource1 = new MemoryProfileDataSource();
    const dataSource2 = new MemoryProfileDataSource();

    // Act
    await dataSource1.updateName("Nome Modificado");

    // Assert
    const profile1 = await dataSource1.getProfile();
    const profile2 = await dataSource2.getProfile();

    expect(profile1.name).toBe("Nome Modificado");
    expect(profile2.name).toBe(mockStudentProfile.name);
  });
});
