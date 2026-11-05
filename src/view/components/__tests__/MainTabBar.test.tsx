import { fireEvent, render, screen } from "@testing-library/react-native";
import { MainTabBar, type MainTabBarProps } from "../MainTabBar";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 24, left: 0 }),
}));

const routes = ["index", "tasks", "routines", "cosmos", "profile"].map(
  (name) => ({ key: `${name}-key`, name }),
);

const createProps = (index: number) => {
  const navigate = jest.fn();
  const emit = jest.fn(() => ({ defaultPrevented: false }));

  const props = {
    state: { index, routes },
    navigation: { navigate, emit },
  } as unknown as MainTabBarProps;

  return { props, navigate, emit };
};

describe("MainTabBar", () => {
  it("seleciona Início na entrada e acompanha a rota exibida", async () => {
    const initial = createProps(0);
    const view = await render(<MainTabBar {...initial.props} />);

    expect(screen.getByRole("tab", { name: /Aba Início/ }).props.accessibilityState.selected).toBe(true);

    await view.rerender(<MainTabBar {...createProps(3).props} />);
    expect(screen.getByRole("tab", { name: /Aba Cosmos/ }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByRole("tab", { name: /Aba Início/ }).props.accessibilityState.selected).toBe(false);
  });

  it("navega ao tocar outra aba e não empilha a aba atual", async () => {
    const { props, navigate, emit } = createProps(0);
    await render(<MainTabBar {...props} />);

    await fireEvent.press(screen.getByRole("tab", { name: /Aba Tarefas/ }));
    expect(emit).toHaveBeenCalledWith({ type: "tabPress", target: "tasks-key", canPreventDefault: true });
    expect(navigate).toHaveBeenCalledWith("tasks");

    await fireEvent.press(screen.getByRole("tab", { name: /Aba Início/ }));
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("respeita um evento de navegação cancelado", async () => {
    const { props, navigate, emit } = createProps(0);
    emit.mockReturnValue({ defaultPrevented: true });
    await render(<MainTabBar {...props} />);

    await fireEvent.press(screen.getByRole("tab", { name: /Aba Perfil/ }));
    expect(navigate).not.toHaveBeenCalled();
  });
});
