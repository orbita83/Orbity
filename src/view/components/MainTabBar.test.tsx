import { fireEvent, render, screen } from "@testing-library/react-native";
import { MainTabBar, type MainTabBarProps } from "./MainTabBar";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 24, left: 0 }),
}));

const routes = ["index", "tasks", "routines", "cosmos", "profile", "new-routine"].map(
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

  it("some nas telas empilhadas, como Nova rotina", async () => {
    await render(<MainTabBar {...createProps(5).props} />);
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("some quando a tela pede tabBarStyle display none, como na seleção múltipla", async () => {
    const { props } = createProps(1);
    const withHiddenBar = { ...props, descriptors: { "tasks-key": { options: { tabBarStyle: { display: "none" } } } } } as unknown as MainTabBarProps;
    await render(<MainTabBar {...withHiddenBar} />);
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("respeita um evento de navegação cancelado", async () => {
    const { props, navigate, emit } = createProps(0);
    emit.mockReturnValue({ defaultPrevented: true });
    await render(<MainTabBar {...props} />);

    await fireEvent.press(screen.getByRole("tab", { name: /Aba Perfil/ }));
    expect(navigate).not.toHaveBeenCalled();
  });
  it.each(["achievements", "categories", "settings"])("mantém cinco abas e seleciona Perfil na rota %s", async (name) => {
    const { props } = createProps(5);
    const hiddenRoutes = [...routes, { key: `${name}-key`, name }];
    await render(<MainTabBar {...props} state={{ ...props.state, routes: hiddenRoutes, index: hiddenRoutes.length - 1 }} />);
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    expect(screen.getByRole("tab", { name: /Aba Perfil/ }).props.accessibilityState.selected).toBe(true);
  });

});
