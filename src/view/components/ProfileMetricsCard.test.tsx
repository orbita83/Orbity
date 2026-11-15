import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ProfileMetricsCard } from "./ProfileMetricsCard";
import { themes } from "../theme/tokens";

describe("ProfileMetricsCard", () => {
  it.each(["cosmic", "light", "dark"] as const)("organiza três colunas na ordem do protótipo com divisores verticais no tema %s", async (mode) => {
    const theme = themes[mode];
    await render(<ProfileMetricsCard metrics={{ streakDays: 1, achievementsCount: 2, studyHours: 3 }} loading={false} theme={theme} />);
    const metrics = [
      screen.getByLabelText("1 dia de sequência"),
      screen.getByLabelText("2 conquistas adquiridas"),
      screen.getByLabelText("3 horas de estudos completos"),
    ];
    const row = metrics[0].parent;
    expect(row).toHaveStyle({ flexDirection: "row", alignItems: "stretch", gap: theme.space.sm });
    expect(row?.children).toHaveLength(5);
    metrics.forEach((metric, index) => {
      expect(row?.children[index * 2]).toBe(metric);
      expect(metric).toHaveStyle({ flex: 1, minWidth: 0, alignItems: "center" });
    });
    [row?.children[1], row?.children[3]].forEach((divider) => {
      expect(divider).toHaveStyle({ width: theme.divider.width, alignSelf: "stretch", backgroundColor: theme.color.border });
      expect(divider && typeof divider !== "string" && divider.props.accessible).toBe(false);
    });
  });

  it("mantém valores e rótulos escaláveis, centralizados e sem altura fixa ou truncamento", async () => {
    const values = { streakDays: 123456789, achievementsCount: 234567890, studyHours: 345678901 };
    await render(<ProfileMetricsCard metrics={values} loading={false} />);
    const texts = ["123.456.789", "234.567.890", "345.678.901", "Dias de sequência", "Conquistas adquiridas", "Horas de estudos completos"];
    texts.forEach((text) => {
      const element = screen.getByText(text);
      expect(element.props.allowFontScaling).toBe(true);
      expect(element.props.numberOfLines).toBeUndefined();
      expect(StyleSheet.flatten(element.props.style).height).toBeUndefined();
      expect(element).toHaveStyle({ textAlign: "center" });
    });
  });

  it("mantém o skeleton em três colunas e a mensagem de vazio abaixo da linha", async () => {
    const view = await render(<ProfileMetricsCard metrics={null} loading />);
    const skeletonRow = view.root?.children[0];
    expect(skeletonRow).toHaveStyle({ flexDirection: "row" });
    expect(skeletonRow && typeof skeletonRow !== "string" && skeletonRow.children).toHaveLength(5);
    expect(skeletonRow && typeof skeletonRow !== "string" && skeletonRow.props.importantForAccessibility).toBe("no-hide-descendants");

    await view.rerender(<ProfileMetricsCard metrics={{ streakDays: 0, achievementsCount: 0, studyHours: 0 }} loading={false} />);
    expect(screen.getByText(/Sua jornada/).parent).toBe(view.root);
    expect(screen.getByLabelText("0 dias de sequência").parent).not.toBe(view.root);
  });

  it.each(["cosmic", "light", "dark"] as const)("mantém contorno independente de elevação no tema %s", async (mode) => {
    const theme = themes[mode];
    const view = await render(<ProfileMetricsCard metrics={{ streakDays: 1, achievementsCount: 2, studyHours: 3 }} loading={false} theme={theme} />);
    const outline = {
      borderColor: theme.color.border,
      borderWidth: theme.divider.width,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.color["surface-variant"],
    };
    expect(view.root).toHaveStyle(outline);

    await view.rerender(<ProfileMetricsCard metrics={null} loading theme={theme} />);
    expect(view.root).toHaveStyle(outline);
  });

  it.each(["cosmic", "light", "dark"] as const)("exibe valores e unidades no tema %s", async (mode) => {
    await render(<ProfileMetricsCard metrics={{ streakDays: 1, achievementsCount: 2, studyHours: 1234 }} loading={false} theme={themes[mode]} />);
    expect(screen.getByLabelText("1 dia de sequência")).toBeTruthy();
    expect(screen.getByLabelText("2 conquistas adquiridas")).toBeTruthy();
    expect(screen.getByLabelText("1.234 horas de estudos completos")).toBeTruthy();
    expect(screen.queryByText(/Sua jornada/)).toBeNull();
  });
  it("acolhe somente quando todas as métricas são zero", async () => {
    await render(<ProfileMetricsCard metrics={{ streakDays: 0, achievementsCount: 0, studyHours: 0 }} loading={false} />);
    expect(screen.getByText(/Sua jornada pode começar no seu ritmo/)).toBeTruthy();
    expect(screen.getByLabelText("0 dias de sequência")).toBeTruthy();
  });
  it("diferencia indisponibilidade de vazio e prioriza carregamento", async () => {
    const view = await render(<ProfileMetricsCard metrics={null} loading={false} />);
    expect(screen.getByText("Métricas indisponíveis no momento.")).toBeTruthy();
    expect(screen.queryByText(/Sua jornada/)).toBeNull();
    await view.rerender(<ProfileMetricsCard metrics={null} loading />);
    expect(screen.getByLabelText("Carregando métricas do perfil").props.accessibilityState.busy).toBe(true);
    expect(screen.queryByText(/indisponíveis/)).toBeNull();
  });
});
