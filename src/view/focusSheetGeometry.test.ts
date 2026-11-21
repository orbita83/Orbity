import {
  clampSheetTop,
  createSheetSnapPoints,
  resolveSheetRelease,
} from "./focusSheetGeometry";

describe("focusSheetGeometry", () => {
  it.each([
    [640, { collapsed: 640, stage1_1: 226.56, stage1_2: 92 }],
    [756, { collapsed: 756, stage1_1: 267.62, stage1_2: 92 }],
    [932, { collapsed: 932, stage1_1: 329.93, stage1_2: 92 }],
  ])("calcula os pontos de parada para a cena de %p dp", (sceneHeight, expected) => {
    const snaps = createSheetSnapPoints({ sceneHeight, expandedTop: 92, collapsedHeight: 0 });
    expect(snaps.collapsed).toBe(expected.collapsed);
    expect(snaps.stage1_1).toBeCloseTo(expected.stage1_1);
    expect(snaps.stage1_2).toBe(expected.stage1_2);
  });

  it("deixa parte do painel visível quando recolhido, se pedido", () => {
    expect(createSheetSnapPoints({ sceneHeight: 800, expandedTop: 92, collapsedHeight: 48 }).collapsed).toBe(752);
  });

  it("nunca deixa os pontos se cruzarem em telas muito baixas", () => {
    const snaps = createSheetSnapPoints({ sceneHeight: 100, expandedTop: 92, collapsedHeight: 0 });
    expect(snaps.stage1_2).toBeLessThan(snaps.stage1_1);
    expect(snaps.stage1_1).toBeLessThan(snaps.collapsed);
  });

  it("limita o topo entre aberto e recolhido", () => {
    const snaps = createSheetSnapPoints({ sceneHeight: 800, expandedTop: 92, collapsedHeight: 0 });
    expect(clampSheetTop(0, snaps)).toBe(92);
    expect(clampSheetTop(2000, snaps)).toBe(800);
  });

  describe("ao soltar", () => {
    const snaps = createSheetSnapPoints({ sceneHeight: 800, expandedTop: 92, collapsedHeight: 0 });

    it("movimento pequeno volta ao estágio de origem", () => {
      expect(resolveSheetRelease("stage1_1", snaps.stage1_1, -20, -0.1, snaps)).toBe("stage1_1");
    });

    it("arrastar para cima além da metade abre um estágio", () => {
      expect(resolveSheetRelease("collapsed", snaps.collapsed, -300, -0.2, snaps)).toBe("stage1_1");
    });

    it("arrastar para baixo, abaixo da metade, reduz um estágio", () => {
      expect(resolveSheetRelease("stage1_2", snaps.stage1_2, 200, 0.2, snaps)).toBe("stage1_1");
    });

    it("um arraste longo para baixo pode recolher por inteiro", () => {
      expect(resolveSheetRelease("stage1_2", snaps.stage1_2, 700, 0.3, snaps)).toBe("collapsed");
    });

    it("um flick rápido curto avança um estágio", () => {
      expect(resolveSheetRelease("stage1_1", snaps.stage1_1, -20, -1, snaps)).toBe("stage1_2");
    });
  });
});
