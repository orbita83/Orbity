import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { CategoryTag } from "@/view/components/CategoryTag";
import { themes } from "@/view/theme/tokens";

describe("CategoryTag", () => {
  it("mostra o rótulo e anuncia a categoria ao leitor de tela", async () => {
    await render(<CategoryTag label="Programação" symbol="code" />);

    expect(screen.getByText("Programação")).toBeTruthy();
    expect(screen.getByLabelText("Categoria: Programação")).toBeTruthy();
  });

  it("não é interativa: não expõe papel de botão nem de opção", async () => {
    await render(<CategoryTag label="Música" symbol="music_note" />);

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it.each(["cosmic", "dark", "light"] as const)(
    "usa color.on-surface sobre color.action-subtle e raio radius.md no tema %s",
    async (name) => {
      const theme = themes[name];
      await render(<CategoryTag label="Leitura" symbol="menu_book" theme={theme} />);

      const label = StyleSheet.flatten(screen.getByText("Leitura").props.style);
      expect(label.color).toBe(theme.color["on-surface"]);
      expect(label.fontSize).toBe(theme.font.label.fontSize);

      const tag = StyleSheet.flatten(screen.getByLabelText("Categoria: Leitura").props.style);
      expect(tag.backgroundColor).toBe(theme.color["action-subtle"]);
      expect(tag.borderRadius).toBe(theme.radius.md);
    },
  );

  it("respeita a escala de fonte do sistema", async () => {
    await render(<CategoryTag label="Idiomas" symbol="translate" />);
    expect(screen.getByText("Idiomas").props.allowFontScaling).toBe(true);
  });
});
