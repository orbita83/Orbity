import {
  DataSourceError,
  DomainError,
  NotificationServiceError,
  SchemaVersionError,
  ValidationError,
} from "@/model/errors";

describe("erros de domínio", () => {
  it.each([
    ["ValidationError", new ValidationError("Informe o título.")],
    ["DataSourceError", new DataSourceError()],
    ["SchemaVersionError", new SchemaVersionError()],
    ["NotificationServiceError", new NotificationServiceError()],
  ])("%s é um DomainError com o próprio nome", (name, error) => {
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe(name);
  });

  it("cada subclasse identifica um único tipo de falha", () => {
    expect(new SchemaVersionError()).not.toBeInstanceOf(DataSourceError);
    expect(new DataSourceError()).not.toBeInstanceOf(SchemaVersionError);
    expect(new ValidationError("x")).not.toBeInstanceOf(DataSourceError);
  });

  it("guarda a mensagem recebida e tem uma mensagem padrão nas falhas de dados", () => {
    expect(new ValidationError("Informe o título.").message).toBe("Informe o título.");
    expect(new DataSourceError().message).toBe("Falha ao acessar o armazenamento local.");
    expect(new DataSourceError("Falha ao salvar.").message).toBe("Falha ao salvar.");
    expect(new NotificationServiceError().message).toBe("Falha ao acessar o serviço de notificações locais.");
    expect(new NotificationServiceError("Falha ao agendar.").message).toBe("Falha ao agendar.");
  });

  it("informa o campo que falhou só quando a regra é de um campo", () => {
    expect(new ValidationError("Informe o título.", "title").field).toBe("title");
    expect(new ValidationError("Término antes do início.").field).toBeUndefined();
  });
});
