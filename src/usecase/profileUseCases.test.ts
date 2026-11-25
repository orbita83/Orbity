import { MemoryDailyActivityDataSource } from "@/infra/datasources/memoryDailyActivityDataSource";
import { LocalDate } from "@/model/entities/localDate";
import type { StudentIdentity } from "@/model/entities/studentProfile";
import { DataSourceError, DomainError, ValidationError } from "@/model/errors";
import type { IDailyActivityDataSource } from "@/model/datasources/iDailyActivityDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { IClockService } from "@/model/services/iClockService";
import { ProfileUseCases } from "./profileUseCases";

const fixedClock: IClockService = {
  now: () => "2026-11-14T10:00:00-03:00",
  todayLocal: () => LocalDate.parse("2026-11-14"),
};

describe("ProfileUseCases", () => {
  let fakeDataSource: IProfileDataSource;
  let dailyActivity: IDailyActivityDataSource;
  let currentIdentity: StudentIdentity;

  const createUseCases = () => new ProfileUseCases(fakeDataSource, dailyActivity, fixedClock);

  beforeEach(() => {
    currentIdentity = { id: "student-1", name: "Alex Silva" };
    dailyActivity = new MemoryDailyActivityDataSource();
    fakeDataSource = {
      getProfile: jest.fn(async () => ({ ...currentIdentity })),
      updateName: jest.fn(async (name: string) => {
        currentIdentity = { ...currentIdentity, name };
        return { ...currentIdentity };
      }),
    };
  });

  describe("getProfile", () => {
    it("deve retornar a identificação guardada com as métricas zeradas quando não há atividade", async () => {
      // Act
      const profile = await createUseCases().getProfile();

      // Assert
      expect(profile).toEqual({ id: "student-1", name: "Alex Silva", streakDays: 0, achievementsCount: 0, studyHours: 0 });
      expect(fakeDataSource.getProfile).toHaveBeenCalledTimes(1);
    });

    it("deve propagar erro de domínio caso o DataSource falhe", async () => {
      // Arrange
      fakeDataSource.getProfile = jest.fn(async () => {
        throw new DataSourceError("Falha na consulta do perfil.");
      });
      const useCases = createUseCases();

      // Act & Assert
      await expect(useCases.getProfile()).rejects.toThrow(DomainError);
      await expect(useCases.getProfile()).rejects.toThrow("Falha na consulta do perfil.");
    });

    it("deve propagar erro de domínio caso o registro diário falhe", async () => {
      // Arrange
      dailyActivity.listDays = jest.fn(async () => {
        throw new DataSourceError("Falha ao ler o registro diário.");
      });

      // Act & Assert
      await expect(createUseCases().getProfile()).rejects.toThrow("Falha ao ler o registro diário.");
    });
  });

  describe("métricas calculadas (issue #249)", () => {
    const recordDays = async (...days: string[]) => {
      for (const day of days) {
        await dailyActivity.recordDay(LocalDate.parse(day), `${day}T10:00:00-03:00`);
      }
    };

    it("deve calcular a sequência a partir do registro diário, contando os dias consecutivos até hoje", async () => {
      // Arrange
      await recordDays("2026-11-12", "2026-11-13", "2026-11-14");

      // Act & Assert
      expect((await createUseCases().getProfile()).streakDays).toBe(3);
    });

    it("deve manter a sequência viva quando o último dia ativo foi ontem", async () => {
      // Arrange
      await recordDays("2026-11-12", "2026-11-13");

      // Act & Assert
      expect((await createUseCases().getProfile()).streakDays).toBe(2);
    });

    it("deve zerar a sequência quando o último dia ativo foi anteontem ou antes", async () => {
      // Arrange
      await recordDays("2026-11-10", "2026-11-11", "2026-11-12");

      // Act & Assert
      expect((await createUseCases().getProfile()).streakDays).toBe(0);
    });

    it("deve ignorar métricas que o DataSource devolva por engano", async () => {
      // Arrange
      fakeDataSource.getProfile = jest.fn(async () => ({
        id: "student-1",
        name: "Alex Silva",
        streakDays: 12,
        achievementsCount: 5,
        studyHours: 42,
      }));

      // Act & Assert
      expect(await createUseCases().getProfile()).toEqual({
        id: "student-1",
        name: "Alex Silva",
        streakDays: 0,
        achievementsCount: 0,
        studyHours: 0,
      });
    });

    it("deve devolver as métricas calculadas também depois de salvar o nome", async () => {
      // Arrange
      await recordDays("2026-11-14");

      // Act
      const updated = await createUseCases().updateName("Ana");

      // Assert
      expect(updated).toEqual({ id: "student-1", name: "Ana", streakDays: 1, achievementsCount: 0, studyHours: 0 });
    });
  });

  describe("updateName", () => {
    it("deve atualizar o nome com sucesso e aplicar o trim nos espaços em branco", async () => {
      // Act
      const updated = await createUseCases().updateName("  Maria Clara Oliveira  ");

      // Assert
      expect(updated.name).toBe("Maria Clara Oliveira");
      expect(fakeDataSource.updateName).toHaveBeenCalledWith("Maria Clara Oliveira");
    });

    it("deve rejeitar nome vazio com ValidationError", async () => {
      // Arrange
      const useCases = createUseCases();

      // Act & Assert
      await expect(useCases.updateName("")).rejects.toThrow(ValidationError);
      await expect(useCases.updateName("")).rejects.toThrow("O nome é obrigatório.");
      expect(fakeDataSource.updateName).not.toHaveBeenCalled();
    });

    it("deve rejeitar nome contendo apenas espaços em branco", async () => {
      // Arrange
      const useCases = createUseCases();

      // Act & Assert
      await expect(useCases.updateName("   \t \n  ")).rejects.toThrow(ValidationError);
      await expect(useCases.updateName("   \t \n  ")).rejects.toThrow("O nome é obrigatório.");
      expect(fakeDataSource.updateName).not.toHaveBeenCalled();
    });

    it("deve rejeitar nome que ultrapasse o limite de 60 caracteres", async () => {
      // Arrange
      const useCases = createUseCases();
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
      const nameWith60Chars = "A".repeat(60);

      // Act
      const updated = await createUseCases().updateName(nameWith60Chars);

      // Assert
      expect(updated.name).toBe(nameWith60Chars);
      expect(fakeDataSource.updateName).toHaveBeenCalledWith(nameWith60Chars);
    });
  });
});
