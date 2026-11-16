/* global jest */
// O Jest não tem o Skia nativo nem o CanvasKit: o planeta animado vira um quadro vazio nos testes.
jest.mock("../../src/view/components/SkiaPlanet", () => ({ SkiaPlanet: () => null }));
