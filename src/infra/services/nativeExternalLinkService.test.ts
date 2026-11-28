import { Linking } from "react-native";
import { ExternalLinkServiceError } from "@/model/errors";
import { NativeExternalLinkService } from "./nativeExternalLinkService";

describe("NativeExternalLinkService", () => {
  afterEach(() => jest.restoreAllMocks());

  it("entrega somente a URL recebida ao sistema", async () => {
    const open = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    await new NativeExternalLinkService().open("https://orbita83.github.io/Orbity/privacidade/");
    expect(open).toHaveBeenCalledWith("https://orbita83.github.io/Orbity/privacidade/");
  });

  it("converte falha nativa para erro puro sem expor detalhes técnicos", async () => {
    jest.spyOn(Linking, "openURL").mockRejectedValue(new Error("native detail"));
    await expect(new NativeExternalLinkService().open("https://orbita83.github.io/Orbity/privacidade/"))
      .rejects.toBeInstanceOf(ExternalLinkServiceError);
  });
});
