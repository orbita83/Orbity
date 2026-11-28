import { planetColors } from "./theme/tokens";

/**
 * Prova de conceito do planeta procedural (#221, caminho B, variante "nebulosa contida").
 *
 * Cada pixel do disco vira um ponto de uma esfera com normal própria. A superfície é ruído
 * de domínio deformado (fbm), recolorido só com as camadas `planetColors` do ODS, e gira
 * uma volta a cada `rotationSeconds`. A luz vem do alto à esquerda, com terminador suave e
 * sem reflexo especular (o ponto de luz forte era o que deixava o planeta com ar metálico).
 * A borda de atmosfera é lavanda e difusa, e o anel tem a metade de trás desenhada antes
 * da esfera. O centro do disco tem um teto de claridade para o contador em branco manter
 * ≥ 4,5:1 no rótulo e ≥ 3:1 no número (medido no teste em WebGL).
 */
/** Raio da esfera no shader, em fração do meio-lado do quadro (o anel ocupa o resto). */
export const PLANET_SPHERE_RATIO = 0.62;

export const PROCEDURAL_PLANET_SKSL = `
uniform float2 size;
uniform float t;
uniform float rotationSeconds;
uniform float showRing;
uniform float ringOrbitSeconds;
uniform float3 cNight;
uniform float3 cShadow;
uniform float3 cRelief;
uniform float3 cSurface;
uniform float3 cLight;
uniform float3 cHigh;
uniform float3 cRing;
uniform float3 cCeiling;

float hash(float3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(float3 x) {
  float3 i = floor(x);
  float3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + float3(0, 0, 0)), hash(i + float3(1, 0, 0)), f.x),
        mix(hash(i + float3(0, 1, 0)), hash(i + float3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + float3(0, 0, 1)), hash(i + float3(1, 0, 1)), f.x),
        mix(hash(i + float3(0, 1, 1)), hash(i + float3(1, 1, 1)), f.x), f.y),
    f.z);
}

float fbm(float3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}

float3 palette(float k) {
  k = clamp(k, 0.0, 1.0);
  if (k < 0.25) return mix(cShadow, cRelief, k / 0.25);
  if (k < 0.55) return mix(cRelief, cSurface, (k - 0.25) / 0.30);
  if (k < 0.85) return mix(cSurface, cLight, (k - 0.55) / 0.30);
  return mix(cLight, cHigh, (k - 0.85) / 0.15);
}

float3 surfaceColor(float3 n) {
  float a = t * 6.2831853 / rotationSeconds;
  float c = cos(a);
  float s = sin(a);
  float3 q = float3(c * n.x + s * n.z, n.y, -s * n.x + c * n.z);
  float3 w = float3(fbm(q * 1.7), fbm(q * 1.7 + 5.2), fbm(q * 1.7 + 9.1));
  float k = smoothstep(0.25, 0.85, fbm(q * 2.4 + w * 2.2));
  return palette(k * 0.85);
}

// Composição "por cima" em alfa pré-multiplicado.
half4 over(half4 dst, float3 color, float alpha) {
  return half4(half3(color * alpha) + dst.rgb * half(1.0 - alpha), half(alpha) + dst.a * half(1.0 - alpha));
}

half4 main(float2 xy) {
  float side = min(size.x, size.y);
  float2 p = (xy - size * 0.5) / (side * 0.5);
  p.y = -p.y;
  float R = ${PLANET_SPHERE_RATIO.toFixed(2)};
  half4 acc = half4(0.0);

  float tilt = -0.28;
  float2 rp = float2(cos(tilt) * p.x - sin(tilt) * p.y, sin(tilt) * p.x + cos(tilt) * p.y);
  float rr = length(float2(rp.x, rp.y / 0.22));
  float ringBand = smoothstep(0.80, 0.83, rr) * (1.0 - smoothstep(0.95, 0.99, rr));
  // Anel em movimento: aglomerados de poeira giram em volta do planeta (motion.planet.ring-orbit).
  // Só a opacidade varia; a cor nunca passa de cRing, para não clarear atrás do contador.
  float ringAngle = atan(rp.y / 0.22, rp.x);
  float spin = t * 6.2831853 / ringOrbitSeconds;
  float dust = fbm(float3(cos(ringAngle - spin) * 2.0, sin(ringAngle - spin) * 2.0, rr * 24.0));
  float clumps = pow(0.5 + 0.5 * sin(3.0 * (ringAngle - spin)), 3.0);
  ringBand *= 0.30 + 0.45 * dust + 0.40 * clumps;
  ringBand = clamp(ringBand, 0.0, 1.0);
  bool ringFront = rp.y < 0.0;

  if (showRing > 0.5 && !ringFront) acc = over(acc, cRing * 0.55, ringBand * 0.6);

  float r = length(p);
  float3 L = normalize(float3(-0.55, 0.6, 0.6));
  if (r < R) {
    float3 n = float3(p / R, 0.0);
    n.z = sqrt(max(0.0, 1.0 - dot(n.xy, n.xy)));
    float diff = dot(n, L);
    float lit = smoothstep(-0.25, 0.65, diff);
    float3 col = mix(cNight, surfaceColor(n), lit);
    float center = 1.0 - smoothstep(0.78, 1.0, length(float2(n.x * 0.95, n.y * 1.6)));
    col = mix(col, min(col, cCeiling), center);
    float rim = pow(1.0 - n.z, 2.6) * smoothstep(-0.2, 0.6, diff);
    col += cLight * rim * 0.55;
    acc = over(acc, col, smoothstep(R, R - 0.006, r));
  } else {
    float halo = exp(-(r - R) * 18.0) * 0.28;
    halo *= smoothstep(-0.4, 0.6, dot(normalize(p), normalize(float2(-0.55, 0.6))));
    acc = over(acc, cLight, clamp(halo, 0.0, 1.0));
  }

  if (showRing > 0.5 && ringFront) acc = over(acc, cRing * 0.85, ringBand * 0.85);
  return acc;
}
`;

const toRgb = (hex: string): [number, number, number] => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

/**
 * Teto de claridade atrás do contador (≈ #7838D1). Derivado de `planetColors.surface`
 * escurecido, para não introduzir um valor literal novo: branco sobre ele ≈ 6:1.
 */
const CEILING_FACTOR = 0.9;

/** Uniformes de cor do shader, vindos dos tokens do planeta (sem valores literais). */
export const proceduralPlanetPalette = {
  cNight: toRgb(planetColors.night),
  cShadow: toRgb(planetColors.shadow),
  cRelief: toRgb(planetColors.relief),
  cSurface: toRgb(planetColors.surface),
  cLight: toRgb(planetColors.light),
  cHigh: toRgb(planetColors.highlight),
  cRing: toRgb(planetColors.ring),
  cCeiling: toRgb(planetColors.surface).map((channel) => channel * CEILING_FACTOR) as [number, number, number],
} as const;
