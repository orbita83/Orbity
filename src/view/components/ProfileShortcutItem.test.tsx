import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ProfileShortcutItem } from "./ProfileShortcutItem";
import { themes } from "../theme/tokens";

const shortcutProps = {
  title: "Conquistas",
  description: "Acompanhe suas conquistas",
  icon: "star",
  onPress: () => {},
} as const;
const theme = themes.cosmic;

// Evento de toque controlado: a interrupção cancela a navegação e permite
// verificar separadamente a entrada e a saída do feedback do Pressable real.
const createTouchEvent = () => ({
  persist: jest.fn(),
  currentTarget: 1,
  nativeEvent: { pageX: 0, pageY: 0, locationX: 0, locationY: 0, timestamp: 0, touches: [] },
});

describe("ProfileShortcutItem", () => {
  it("expõe o atalho como link com título, descrição e alvo mínimo", async () => {
    await render(<ProfileShortcutItem {...shortcutProps} />);
    const link = screen.getByRole("link", { name: "Conquistas" });

    expect(link.props.accessibilityHint).toBe(shortcutProps.description);
    expect(link).toHaveStyle({ minHeight: theme.target.minSize, borderRadius: theme.radius.lg });
    expect(screen.getByText("Acompanhe suas conquistas")).toBeTruthy();
  });

  it("chama a ação da ViewModel ao tocar no atalho", async () => {
    const onPress = jest.fn();
    await render(<ProfileShortcutItem {...shortcutProps} onPress={onPress} />);
    await fireEvent.press(screen.getByRole("link", { name: "Conquistas" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("mostra e remove o contorno de foco com a geometria do ODS", async () => {
    const view = await render(<ProfileShortcutItem {...shortcutProps} />);
    const link = screen.getByRole("link", { name: "Conquistas" });
    const geometry = {
      borderWidth: theme.focus.ringWidth,
      padding: theme.focus.ringOffset,
      borderRadius: theme.radius.lg + theme.focus.ringOffset + theme.focus.ringWidth,
    };
    expect(view.root).toHaveStyle({ ...geometry, borderColor: theme.color.surface });

    await fireEvent(link, "focus");
    expect(view.root).toHaveStyle({ ...geometry, borderColor: theme.color.focus });

    await fireEvent(link, "blur");
    expect(view.root).toHaveStyle({ ...geometry, borderColor: theme.color.surface });
  });

  it("aplica o pressionado do ODS no card inteiro", async () => {
    jest.useFakeTimers();
    try {
      await render(<ProfileShortcutItem {...shortcutProps} />);
      const link = screen.getByRole("link", { name: "Conquistas" });
      expect(link.children[0]).not.toHaveStyle({ opacity: theme.motion.opacityPressed });

      await fireEvent(link, "responderGrant", createTouchEvent());
      expect(link.children[0]).toHaveStyle({ opacity: theme.motion.opacityPressed });

      await fireEvent(link, "responderTerminate", createTouchEvent());
      await act(async () => {
        jest.runOnlyPendingTimers();
      });
      expect(link.children[0]).not.toHaveStyle({ opacity: theme.motion.opacityPressed });
    } finally {
      jest.useRealTimers();
    }
  });

  it("descarta o foco anterior na transição entre carregamento e sucesso", async () => {
    const view = await render(<ProfileShortcutItem {...shortcutProps} />);
    await fireEvent(screen.getByRole("link", { name: "Conquistas" }), "focus");
    expect(view.root).toHaveStyle({ borderColor: theme.color.focus });

    // Sem disparar blur artificialmente: o controle é removido pelo carregamento.
    await view.rerender(<ProfileShortcutItem {...shortcutProps} loading />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByLabelText("Carregando atalho Conquistas").props.accessibilityState.busy).toBe(true);

    await view.rerender(<ProfileShortcutItem {...shortcutProps} />);
    expect(view.root).toHaveStyle({ borderColor: theme.color.surface });
    expect(screen.queryByLabelText("Carregando atalho Conquistas")).toBeNull();
  });

  it("não disponibiliza interação durante o carregamento inicial", async () => {
    await render(<ProfileShortcutItem {...shortcutProps} loading />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByLabelText("Carregando atalho Conquistas").props.accessibilityState.busy).toBe(true);
  });
});
