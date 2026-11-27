import { fireEvent, render, screen } from "@testing-library/react-native";
import { GradientSurface } from "@/view/components/GradientSurface";

const layoutEvent = (width: number, height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width, height } } });

describe("GradientSurface", () => {
  it("pinta a cor de início antes da primeira medição, sem a Svg", async () => {
    await render(<GradientSurface testID="surface" from="#112233" to="#445566" horizontal />);

    expect(screen.getByTestId("surface")).toHaveStyle({ backgroundColor: "#112233" });
    expect(screen.queryByTestId("surface-svg")).toBeNull();
  });

  it("acompanha o tamanho medido quando o preenchimento cresce até 100%", async () => {
    await render(<GradientSurface testID="surface" from="#112233" to="#445566" horizontal />);

    await fireEvent(screen.getByTestId("surface"), "layout", layoutEvent(200, 8));
    expect(screen.getByTestId("surface-svg").props).toMatchObject({ width: 200, height: 8 });

    await fireEvent(screen.getByTestId("surface"), "layout", layoutEvent(300, 8));
    expect(screen.getByTestId("surface-svg").props).toMatchObject({ width: 300, height: 8 });
  });
});
