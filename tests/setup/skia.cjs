/* global jest */
// O Jest não tem o Skia nativo nem o CanvasKit: o planeta procedural (#221) vira um quadro vazio nos testes.
jest.mock("../../src/view/components/ProceduralPlanet", () => ({ ProceduralPlanet: () => null }));
