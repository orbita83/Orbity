import { PrivacyUseCases } from "./privacyUseCases";

describe("PrivacyUseCases", () => {
  it("abre a URL oficial sem dados do estudante ou parâmetros", async () => {
    const open = jest.fn(async () => {});
    await new PrivacyUseCases({ open }).openPolicy();
    expect(open).toHaveBeenCalledWith("https://orbita83.github.io/Orbity/privacidade/");
  });
});
