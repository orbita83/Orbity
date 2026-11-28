/* global jest */
// O Jest não tem o Skia nativo nem o CanvasKit: o planeta procedural (#221) e o céu animado (#286)
// viram quadros vazios nos testes.
jest.mock("../../src/view/components/ProceduralPlanet", () => ({ ProceduralPlanet: () => null }));
jest.mock("../../src/view/components/CosmicSky", () => ({ CosmicSky: () => null }));
