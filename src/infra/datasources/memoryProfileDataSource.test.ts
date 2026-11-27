import { initialStudentIdentity, MemoryProfileDataSource } from "./memoryProfileDataSource";
import { describeProfileDataSourceContract } from "./profileDataSource.contract";

describeProfileDataSourceContract("MemoryProfileDataSource", async () => ({
  dataSource: new MemoryProfileDataSource(),
}));

describe("MemoryProfileDataSource", () => {
  it("deve começar sem nome quando nenhuma identificação inicial for passada", async () => {
    // Arrange
    const dataSource = new MemoryProfileDataSource();

    // Act
    const profile = await dataSource.getProfile();

    // Assert
    expect(profile).toEqual(initialStudentIdentity);
    expect(profile).toEqual({ id: "local-student", name: "" });
  });

  it("deve carregar a identificação inicial fornecida no construtor", async () => {
    // Arrange
    const dataSource = new MemoryProfileDataSource({ id: "student-custom", name: "Camila Santos" });

    // Act
    const profile = await dataSource.getProfile();

    // Assert
    expect(profile).toEqual({ id: "student-custom", name: "Camila Santos" });
  });

  it("deve guardar só id e nome, sem métricas, mesmo recebendo um perfil completo", async () => {
    // Arrange
    const fullProfile = { id: "student-1", name: "Ana", streakDays: 12, achievementsCount: 5, studyHours: 42 };
    const dataSource = new MemoryProfileDataSource(fullProfile);

    // Act
    const profile = await dataSource.getProfile();

    // Assert
    expect(profile).toEqual({ id: "student-1", name: "Ana" });
  });

  it("deve atualizar o nome e persistir a alteração para chamadas subsequentes", async () => {
    // Arrange
    const dataSource = new MemoryProfileDataSource({ id: "student-1", name: "Ana" });

    // Act
    const updated = await dataSource.updateName("Lucas Mendes");
    const retrieved = await dataSource.getProfile();

    // Assert
    expect(updated).toEqual({ id: "student-1", name: "Lucas Mendes" });
    expect(retrieved).toEqual({ id: "student-1", name: "Lucas Mendes" });
  });

  it("deve manter isolamento de dados entre instâncias distintas", async () => {
    // Arrange
    const dataSource1 = new MemoryProfileDataSource();
    const dataSource2 = new MemoryProfileDataSource();

    // Act
    await dataSource1.updateName("Nome Modificado");

    // Assert
    expect((await dataSource1.getProfile()).name).toBe("Nome Modificado");
    expect((await dataSource2.getProfile()).name).toBe("");
    expect(initialStudentIdentity.name).toBe("");
  });
});
