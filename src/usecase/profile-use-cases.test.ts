import { mockStudentProfile } from "@/model/__fixtures__/student-profile.fixture";
import type { StudentProfile } from "@/model/entities/student-profile";
import { DomainError, ValidationError } from "@/model/errors/domain-error";
import type { IProfileRepository } from "@/model/repositories/profile-repository";
import { ProfileUseCases } from "./profile-use-cases";

describe("ProfileUseCases", () => {
  let fakeRepository: IProfileRepository;
  let currentProfile: StudentProfile;

  beforeEach(() => {
    currentProfile = { ...mockStudentProfile };
    fakeRepository = {
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
      const useCases = new ProfileUseCases(fakeRepository);

      // Act
      const profile = await useCases.getProfile();

      // Assert
      expect(profile).toEqual(mockStudentProfile);
      expect(fakeRepository.getProfile).toHaveBeenCalledTimes(1);
    });

    it("deve propagar erro de domínio caso o repositório falhe", async () => {
      // Arrange
      fakeRepository.getProfile = jest.fn(async () => {
        throw new DomainError("Falha na consulta do perfil.", "PROFILE_FETCH_FAILED");
      });
      const useCases = new ProfileUseCases(fakeRepository);

      // Act & Assert
      await expect(useCases.getProfile()).rejects.toThrow(DomainError);
      await expect(useCases.getProfile()).rejects.toThrow("Falha na consulta do perfil.");
    });
  });

  describe("updateName", () => {
    it("deve atualizar o nome com sucesso e aplicar o trim nos espaços em branco", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeRepository);
      const newName = "  Maria Clara Oliveira  ";

      // Act
      const updated = await useCases.updateName(newName);

      // Assert
      expect(updated.name).toBe("Maria Clara Oliveira");
      expect(fakeRepository.updateName).toHaveBeenCalledWith("Maria Clara Oliveira");
    });

    it("deve rejeitar nome vazio com ValidationError", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeRepository);

      // Act & Assert
      await expect(useCases.updateName("")).rejects.toThrow(ValidationError);
      await expect(useCases.updateName("")).rejects.toThrow("O nome é obrigatório.");
      expect(fakeRepository.updateName).not.toHaveBeenCalled();
    });

    it("deve rejeitar nome contendo apenas espaços em branco", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeRepository);

      // Act & Assert
      await expect(useCases.updateName("   \t \n  ")).rejects.toThrow(ValidationError);
      await expect(useCases.updateName("   \t \n  ")).rejects.toThrow("O nome é obrigatório.");
      expect(fakeRepository.updateName).not.toHaveBeenCalled();
    });

    it("deve rejeitar nome que ultrapasse o limite de 60 caracteres", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeRepository);
      const nameWith61Chars = "A".repeat(61);

      // Act & Assert
      await expect(useCases.updateName(nameWith61Chars)).rejects.toThrow(ValidationError);
      await expect(useCases.updateName(nameWith61Chars)).rejects.toThrow(
        "O nome deve ter no máximo 60 caracteres.",
      );
      expect(fakeRepository.updateName).not.toHaveBeenCalled();
    });

    it("deve aceitar nome exatamente no limite de 60 caracteres", async () => {
      // Arrange
      const useCases = new ProfileUseCases(fakeRepository);
      const nameWith60Chars = "A".repeat(60);

      // Act
      const updated = await useCases.updateName(nameWith60Chars);

      // Assert
      expect(updated.name).toBe(nameWith60Chars);
      expect(fakeRepository.updateName).toHaveBeenCalledWith(nameWith60Chars);
    });
  });
});
