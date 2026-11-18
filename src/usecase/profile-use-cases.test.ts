import { mockStudentProfile } from "@/model/__fixtures__/student-profile.fixture";
import type { StudentProfile } from "@/model/entities/student-profile";
import { DomainError, ValidationError } from "@/model/errors/domain-error";
import type { IProfileDataSource } from "@/model/datasources/i-profile-datasource";
import { ProfileUseCases } from "./profile-use-cases";

describe("ProfileUseCases", () => {
  let fakeDataSource: IProfileDataSource;
  let currentProfile: StudentProfile;

  beforeEach(() => {
    currentProfile = { ...mockStudentProfile };
    fakeDataSource = {
      getProfile: jest.fn(async () => ({ ...currentProfile })),
      updateName: jest.fn(async (name: string) => {
        currentProfile = { ...currentProfile, name };
        return { ...currentProfile };
      }),
    };
  });

  describe("getProfile", () => {
    it("deve retornar o perfil do estudante com sucesso", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeDataSource);

      // Act
      const profile = await useCases.getProfile();

      // Assert
      expect(profile).toEqual(mockStudentProfile);
      expect(fakeDataSource.getProfile).toHaveBeenCalledTimes(1);
    });

    it("deve propagar erro de domínio caso o DataSource falhe", async () => {
      // Arrange
      fakeDataSource.getProfile = jest.fn(async () => {
        throw new DomainError("PERSISTENCE_FAILURE", "Falha na consulta do perfil.");
      });
      const useCases = new ProfileUseCases(fakeDataSource);

      // Act & Assert
      await expect(useCases.getProfile()).rejects.toThrow(DomainError);
      await expect(useCases.getProfile()).rejects.toThrow("Falha na consulta do perfil.");
    });
  });

  describe("updateName", () => {
    it("deve atualizar o nome com sucesso e aplicar o trim nos espaços em branco", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeDataSource);
      const newName = "  Maria Clara Oliveira  ";

      // Act
      const updated = await useCases.updateName(newName);

      // Assert
      expect(updated.name).toBe("Maria Clara Oliveira");
      expect(fakeDataSource.updateName).toHaveBeenCalledWith("Maria Clara Oliveira");
    });

    it("deve rejeitar nome vazio com ValidationError", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeDataSource);

      // Act & Assert
      await expect(useCases.updateName("")).rejects.toThrow(ValidationError);
      await expect(useCases.updateName("")).rejects.toThrow("O nome é obrigatório.");
      expect(fakeDataSource.updateName).not.toHaveBeenCalled();
    });

    it("deve rejeitar nome contendo apenas espaços em branco", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeDataSource);

      // Act & Assert
      await expect(useCases.updateName("   \t \n  ")).rejects.toThrow(ValidationError);
      await expect(useCases.updateName("   \t \n  ")).rejects.toThrow("O nome é obrigatório.");
      expect(fakeDataSource.updateName).not.toHaveBeenCalled();
    });

    it("deve rejeitar nome que ultrapasse o limite de 60 caracteres", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeDataSource);
      const nameWith61Chars = "A".repeat(61);

      // Act & Assert
      await expect(useCases.updateName(nameWith61Chars)).rejects.toThrow(ValidationError);
      await expect(useCases.updateName(nameWith61Chars)).rejects.toThrow(
        "O nome deve ter no máximo 60 caracteres.",
      );
      expect(fakeDataSource.updateName).not.toHaveBeenCalled();
    });

    it("deve aceitar nome exatamente no limite de 60 caracteres", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeDataSource);
      const nameWith60Chars = "A".repeat(60);

      // Act
      const updated = await useCases.updateName(nameWith60Chars);

      // Assert
      expect(updated.name).toBe(nameWith60Chars);
      expect(fakeDataSource.updateName).toHaveBeenCalledWith(nameWith60Chars);
    });
  });
});
