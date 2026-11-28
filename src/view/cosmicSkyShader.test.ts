import { cosmicColors, motionTokens } from "./theme/tokens";
import { COSMIC_SKY_SKSL, cosmicSkyUniforms } from "./cosmicSkyShader";

describe("céu animado (#286)", () => {
  it("usa só as cores do ODS para estrelas e estrelas cadentes", () => {
    const hex = (rgb: readonly number[]) => "#" + rgb.map((c) => Math.round(c * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
    expect(hex(cosmicSkyUniforms.cText)).toBe(cosmicColors.text);
    expect(hex(cosmicSkyUniforms.cMuted)).toBe(cosmicColors.muted);
    expect(hex(cosmicSkyUniforms.cFocus)).toBe(cosmicColors.focus);
  });

  it("segue os tokens de movimento ambiente", () => {
    expect(cosmicSkyUniforms.cell).toBe(motionTokens.ambientStarCell);
    expect(cosmicSkyUniforms.shootingEvery).toBe(motionTokens.ambientShootingEvery);
    expect(motionTokens.ambientTwinkleMin).toBeLessThan(motionTokens.ambientTwinkleMax);
  });

  it("declara todos os uniformes que o componente envia", () => {
    for (const name of ["size", "t", "shooting", "glow", ...Object.keys(cosmicSkyUniforms)]) {
      expect(COSMIC_SKY_SKSL).toMatch(new RegExp(`uniform float[23]? ${name};`));
    }
  });
});
