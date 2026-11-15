import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ProfileShortcutItem } from "./ProfileShortcutItem";
import { themes } from "../theme/tokens";

const shortcutProps = {
  title: "Conquistas",
  description: "Acompanhe suas conquistas",
  href: "/achievements",
  icon: "emoji_events",
} as const;
const themeModes = ["cosmic", "light", "dark"] as const;

// Evento de toque controlado: a interrupção cancela a navegação e permite
// verificar separadamente a entrada e a saída do feedback do Pressable real.
const createTouchEvent = () => ({
  persist: jest.fn(),
  currentTarget: 1,
  nativeEvent: { pageX: 0, pageY: 0, locationX: 0, locationY: 0, timestamp: 0, touches: [] },
});

describe("ProfileShortcutItem", () => {
  it.each(themeModes)("mostra e remove foco com a geometria do ODS no tema %s", async (mode) => {
    const theme = themes[mode];
    const view = await render(<ProfileShortcutItem {...shortcutProps} theme={theme} />);
    const link = screen.getByRole("link", { name: "Conquistas" });
    const geometry = {
      borderWidth: theme.focus.ringWidth,
      padding: theme.focus.ringOffset,
      borderRadius: theme.radius.md + theme.focus.ringOffset + theme.focus.ringWidth,
    };
    expect(link.props.accessibilityHint).toBe(shortcutProps.description);
    expect(link).toHaveStyle({ minHeight: theme.target.minSize, minWidth: theme.target.minSize });
    expect(view.root).toHaveStyle({ ...geometry, borderColor: theme.color.surface });

    await fireEvent(link, "focus");
    expect(view.root).toHaveStyle({ ...geometry, borderColor: theme.color.focus });

    await fireEvent(link, "blur");
    expect(view.root).toHaveStyle({ ...geometry, borderColor: theme.color.surface });
  });

  it.each(themeModes)("aplica feedback pressionado somente no ícone no tema %s", async (mode) => {
    jest.useFakeTimers();
    try {
      const theme = themes[mode];
      const view = await render(<ProfileShortcutItem {...shortcutProps} theme={theme} />);
      const link = screen.getByRole("link", { name: "Conquistas" });
      await fireEvent(link, "focus");
      expect(link.children[0]).not.toHaveStyle({ opacity: theme.feedback.pressedOpacity });

      await fireEvent(link, "responderGrant", createTouchEvent());
      expect(link.children[0]).toHaveStyle({ opacity: theme.feedback.pressedOpacity });
      expect(link).not.toHaveStyle({ opacity: theme.feedback.pressedOpacity });
      expect(screen.getByText("Conquistas")).not.toHaveStyle({ opacity: theme.feedback.pressedOpacity });
      expect(view.root).toHaveStyle({ borderColor: theme.color.focus });
      expect(view.root).not.toHaveStyle({ opacity: theme.feedback.pressedOpacity });

      await fireEvent(link, "responderTerminate", createTouchEvent());
      await act(async () => { jest.runOnlyPendingTimers(); });
      expect(link.children[0]).not.toHaveStyle({ opacity: theme.feedback.pressedOpacity });
      expect(view.root).toHaveStyle({ borderColor: theme.color.focus });
    } finally {
      jest.useRealTimers();
    }
  });

  it.each(themeModes)("descarta o foco anterior na transição carregamento e sucesso no tema %s", async (mode) => {
    const theme = themes[mode];
    const view = await render(<ProfileShortcutItem {...shortcutProps} theme={theme} />);
    await fireEvent(screen.getByRole("link", { name: "Conquistas" }), "focus");
    expect(view.root).toHaveStyle({ borderColor: theme.color.focus });

    // Sem disparar blur artificialmente: o controle é removido pelo carregamento.
    await view.rerender(<ProfileShortcutItem {...shortcutProps} theme={theme} loading />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByLabelText("Carregando atalho Conquistas").props.accessibilityState.busy).toBe(true);

    await view.rerender(<ProfileShortcutItem {...shortcutProps} theme={theme} />);
    expect(view.root).toHaveStyle({ borderColor: theme.color.surface });
    expect(screen.queryByLabelText("Carregando atalho Conquistas")).toBeNull();
    const restoredLink = screen.getByRole("link", { name: "Conquistas" });
    await fireEvent(restoredLink, "focus");
    expect(view.root).toHaveStyle({ borderColor: theme.color.focus });
    await fireEvent(restoredLink, "blur");
    expect(view.root).toHaveStyle({ borderColor: theme.color.surface });
  });

  it("não disponibiliza interação durante carregamento inicial", async () => {
    await render(<ProfileShortcutItem {...shortcutProps} loading />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByLabelText("Carregando atalho Conquistas").props.accessibilityState.busy).toBe(true);
  });
});
