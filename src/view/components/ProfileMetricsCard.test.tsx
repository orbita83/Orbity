import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ProfileMetricsCard } from "./ProfileMetricsCard";
import { cosmicBorders, themes } from "../theme/tokens";

const theme = themes.cosmic;

describe("ProfileMetricsCard", () => {
  it("mostra o título Sua jornada e três quadros na ordem do protótipo", async () => {
    await render(<ProfileMetricsCard metrics={{ streakDays: 1, achievementsCount: 2, studyHours: 3 }} loading={false} />);

    expect(screen.getByRole("header", { name: "Sua jornada" })).toBeTruthy();
    const tiles = [
      screen.getByLabelText("1 dia de sequência"),
      screen.getByLabelText("2 conquistas"),
      screen.getByLabelText("3 horas de estudo"),
    ];
    const grid = tiles[0].parent;
    expect(grid).toHaveStyle({ flexDirection: "row", gap: theme.space.sm });
    expect(grid?.children).toHaveLength(3);
    tiles.forEach((tile, index) => {
      expect(grid?.children[index]).toBe(tile);
      expect(tile).toHaveStyle({
        flex: 1,
        minWidth: 0,
        borderRadius: theme.radius.lg,
        borderWidth: theme.border.widthThin,
        borderColor: cosmicBorders.card,
      });
    });
  });

  it("usa singular e plural na unidade e formata números em pt-BR", async () => {
    await render(<ProfileMetricsCard metrics={{ streakDays: 12, achievementsCount: 1, studyHours: 1234 }} loading={false} />);

    expect(screen.getByLabelText("12 dias de sequência")).toBeTruthy();
    expect(screen.getByLabelText("1 conquista")).toBeTruthy();
    expect(screen.getByLabelText("1.234 horas de estudo")).toBeTruthy();
    expect(screen.queryByText(/Sua jornada pode começar/)).toBeNull();
  });

  it("mantém os rótulos escaláveis e sem altura fixa", async () => {
    await render(<ProfileMetricsCard metrics={{ streakDays: 2, achievementsCount: 5, studyHours: 42 }} loading={false} />);

    ["dias de sequência", "conquistas", "horas de estudo"].forEach((text) => {
      const element = screen.getByText(text);
      expect(element.props.allowFontScaling).toBe(true);
      expect(StyleSheet.flatten(element.props.style).height).toBeUndefined();
      expect(element).toHaveStyle({ textAlign: "center" });
    });
  });

  it("acolhe somente quando todas as métricas são zero", async () => {
    await render(<ProfileMetricsCard metrics={{ streakDays: 0, achievementsCount: 0, studyHours: 0 }} loading={false} />);

    expect(screen.getByText(/Sua jornada pode começar no seu ritmo/)).toBeTruthy();
    expect(screen.getByLabelText("0 dias de sequência")).toBeTruthy();
  });

  it("diferencia indisponibilidade de vazio e prioriza carregamento", async () => {
    const view = await render(<ProfileMetricsCard metrics={null} loading={false} />);
    expect(screen.getByText("Métricas indisponíveis no momento.")).toBeTruthy();
    expect(screen.queryByText(/Sua jornada pode começar/)).toBeNull();

    await view.rerender(<ProfileMetricsCard metrics={null} loading />);
    const skeleton = screen.getByLabelText("Carregando métricas do perfil");
    expect(skeleton.props.accessibilityState.busy).toBe(true);
    expect(screen.queryByText(/indisponíveis/)).toBeNull();
    expect(screen.queryByRole("header", { name: "Sua jornada" })).toBeNull();
  });
});
