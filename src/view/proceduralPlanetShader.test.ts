import { motionTokens, planetColors, themes } from "./theme/tokens";
import { PROCEDURAL_PLANET_SKSL, proceduralPlanetPalette } from "./proceduralPlanetShader";

const luminance = ([r, g, b]: readonly number[]) => {
  const linear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};
const hexToRgb = (hex: string) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
const contrast = (a: readonly number[], b: readonly number[]) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};

describe("planeta procedural (#221)", () => {
  it("recolore o shader só com as camadas do planeta do ODS", () => {
    expect(proceduralPlanetPalette.cNight).toEqual(hexToRgb(planetColors.night));
    expect(proceduralPlanetPalette.cSurface).toEqual(hexToRgb(planetColors.surface));
    expect(proceduralPlanetPalette.cRing).toEqual(hexToRgb(planetColors.ring));
  });

  it("mantém o centro escuro o bastante para o contador em on-surface (≥ 4,5:1)", () => {
    const text = hexToRgb(themes.cosmic.color["on-surface"]);
    expect(contrast(text, proceduralPlanetPalette.cCeiling)).toBeGreaterThanOrEqual(4.5);
  });

  it("declara todos os uniformes que o componente envia", () => {
    for (const name of ["size", "t", "rotationSeconds", "showRing", ...Object.keys(proceduralPlanetPalette)]) {
      expect(PROCEDURAL_PLANET_SKSL).toContain(`uniform ${name === "size" ? "float2" : name.startsWith("c") ? "float3" : "float"} ${name};`);
    }
  });

  it("gira uma volta a cada motion.planet.rotation (24 s)", () => {
    expect(motionTokens.planetRotation).toBe(24000);
  });
});
