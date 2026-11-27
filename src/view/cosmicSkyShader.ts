import { cosmicColors, motionTokens } from "./theme/tokens";

/**
 * Céu animado do Orbity (#286), desenhado num único shader do Skia por tela.
 *
 * A tela é dividida numa grade de células (`motion.ambient.star-cell`); cada célula pode ter
 * uma estrela de 0,6 a 1,5 dp em posição aleatória, que cintila com fase e ritmo próprios
 * (`motion.ambient.twinkle-*`). A cada `motion.ambient.shooting-every`, no máximo uma estrela
 * cadente fina cruza parte da tela. Só as cores do ODS: `on-surface`, `on-surface-variant` e a
 * lavanda `focus`. O shader é transparente fora das estrelas: o fundo da tela continua sendo
 * `color.surface`, e nenhum texto depende dele.
 */
export const COSMIC_SKY_SKSL = `
uniform float2 size;
uniform float t;
uniform float shooting;
uniform float glow;
uniform float cell;
uniform float twinkleMin;
uniform float twinkleMax;
uniform float shootingEvery;
uniform float shootingDuration;
uniform float3 cText;
uniform float3 cMuted;
uniform float3 cFocus;
uniform float3 cSheet;

float hash(float2 p) {
  p = fract(p * float2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

half4 main(float2 xy) {
  float3 col = float3(0.0);
  float alpha = 0.0;

  // Brilho de fundo da Tela Inicial (o mesmo do protótipo: painel no alto, fundo embaixo).
  if (glow > 0.5) {
    float2 q = (xy - float2(size.x * 0.5, size.y * 0.35)) / float2(size.x * 1.2, size.y * 0.7);
    float g = 1.0 - smoothstep(0.0, 0.7, length(q));
    col += cSheet * g;
    alpha += g;
  }

  // Estrelas: até uma por célula, nas três vizinhanças para não cortar o brilho na borda.
  float2 id = floor(xy / cell);
  for (int dx = -1; dx <= 1; dx++) {
    for (int dy = -1; dy <= 1; dy++) {
      float2 c = id + float2(float(dx), float(dy));
      float h = hash(c);
      if (h < 0.55) continue;
      float2 pos = (c + float2(hash(c + 3.1), hash(c + 7.7))) * cell;
      float radius = 0.6 + 0.9 * hash(c + 11.3);
      float d = length(xy - pos);
      float core = smoothstep(radius + 0.8, radius - 0.2, d);
      float halo = exp(-d * d / (radius * radius * 6.0)) * 0.35;
      float period = (twinkleMin + (twinkleMax - twinkleMin) * hash(c + 19.9)) / 1000.0;
      float tw = 0.25 + 0.75 * (0.5 + 0.5 * sin(6.2831853 * t / period + h * 40.0));
      float3 tint = hash(c + 23.7) < 0.6 ? cText : (hash(c + 29.3) < 0.5 ? cMuted : cFocus);
      float a = clamp((core + halo) * tw, 0.0, 1.0);
      col += tint * a;
      alpha += a;
    }
  }

  // Estrela cadente: uma por ciclo, em posição e ângulo sorteados pelo número do ciclo.
  if (shooting > 0.5) {
    float every = shootingEvery / 1000.0;
    float dur = shootingDuration / 1000.0;
    float k = floor(t / every);
    float local = t - k * every;
    if (local < dur) {
      float p = local / dur;
      float2 start = float2(size.x * (0.45 + 0.5 * hash(float2(k, 1.0))), size.y * (0.05 + 0.4 * hash(float2(k, 2.0))));
      float ang = radians(200.0 + 25.0 * hash(float2(k, 3.0)));
      float2 dir = float2(cos(ang), -sin(ang));
      float travel = min(size.x, size.y) * 0.7;
      float2 head = start + dir * travel * p;
      float trail = 90.0;
      float2 rel = xy - head;
      float along = dot(rel, -dir);
      float across = abs(dot(rel, float2(-dir.y, dir.x)));
      if (along > -2.0 && along < trail) {
        float fadeTrail = 1.0 - clamp(along / trail, 0.0, 1.0);
        float width = 0.9 + 0.6 * fadeTrail;
        float line = smoothstep(width, 0.0, across) * fadeTrail;
        float life = sin(3.14159265 * p);
        float a = clamp(line * life, 0.0, 1.0);
        col += mix(cFocus, cText, fadeTrail) * a;
        alpha += a;
      }
    }
  }

  alpha = clamp(alpha, 0.0, 1.0);
  return half4(half3(min(col, float3(1.0))), half(alpha));
}
`;

const toRgb = (hex: string): [number, number, number] => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

/** Uniformes fixos do céu, vindos dos tokens (sem valores literais). */
export const cosmicSkyUniforms = {
  cell: motionTokens.ambientStarCell,
  twinkleMin: motionTokens.ambientTwinkleMin,
  twinkleMax: motionTokens.ambientTwinkleMax,
  shootingEvery: motionTokens.ambientShootingEvery,
  shootingDuration: motionTokens.ambientShootingDuration,
  cText: toRgb(cosmicColors.text),
  cMuted: toRgb(cosmicColors.muted),
  cFocus: toRgb(cosmicColors.focus),
  cSheet: toRgb(cosmicColors.sheet),
} as const;
