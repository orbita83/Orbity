import { useEffect } from "react";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Oval,
  Path,
  RadialGradient,
  Skia,
  SweepGradient,
  vec,
  type Transforms3d,
} from "@shopify/react-native-skia";
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { cosmicColors, planetColors } from "../theme/tokens";
import { PLANET_ARTBOARD, PLANET_SPHERE } from "./PlanetIllustration";

// Experimento (feat/planeta-animado): o planeta desenhado em camadas no Skia, todas na grade de 280.
// Um relógio único de 60 s dirige tudo; cada ciclo divide 60 s, então o laço não dá saltos.
const CLOCK_MS = 60_000;
const TAU = Math.PI * 2;

/** Ciclos de cada camada, em segundos (propostas do experimento, ainda fora do ODS). */
const CYCLE = { ring: 10, moon: 20, surface: 60, glow: 4, meteor: 7.5, rocks: 12 } as const;

const { cx, cy, r } = PLANET_SPHERE;
const RING = { cx: 140, cy: 148, rx: 132, ry: 30, angle: (-16 * Math.PI) / 180, width: 10 } as const;
const MOON_ORBIT = { rx: 116, ry: 42, r: 15 } as const;
/** Margem do canvas além da grade de 280: o brilho desfocado termina antes da borda, sem recorte quadrado. */
const BLEED = 48;

const STAR = Skia.Path.MakeFromSVGString("M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z")!;
const SPARKLES = [
  { x: 62, y: 58, s: 0.9, phase: 0 },
  { x: 232, y: 104, s: 0.7, phase: 0.35 },
  { x: 30, y: 176, s: 0.75, phase: 0.6 },
  { x: 196, y: 252, s: 0.85, phase: 0.15 },
  { x: 258, y: 168, s: 0.55, phase: 0.8 },
] as const;

/** Crateras numa faixa de 2r que desliza por trás do recorte da esfera, sugerindo a rotação. */
const SPAN = r * 2;
const CRATERS = [
  { x: 30, y: 168, rx: 17, ry: 11, color: planetColors.relief, opacity: 0.4 },
  { x: 92, y: 104, rx: 13, ry: 9, color: planetColors.relief, opacity: 0.35 },
  { x: 108, y: 192, rx: 21, ry: 13, color: planetColors.shadow, opacity: 0.38 },
  { x: 48, y: 86, rx: 9, ry: 6, color: planetColors.light, opacity: 0.35 },
  { x: 150, y: 146, rx: 10, ry: 7, color: planetColors.relief, opacity: 0.38 },
  { x: 172, y: 92, rx: 15, ry: 10, color: planetColors.shadow, opacity: 0.4 },
] as const;

const phaseOf = (clock: number, seconds: number) => {
  "worklet";
  return ((clock * CLOCK_MS) / (seconds * 1000)) % 1;
};

const ringPoint = (lx: number, ly: number) => {
  "worklet";
  const cos = Math.cos(RING.angle);
  const sin = Math.sin(RING.angle);
  return { x: RING.cx + lx * cos - ly * sin, y: RING.cy + lx * sin + ly * cos };
};

export type SkiaPlanetCanvasProps = {
  /** Lado do desenho, em dp. */
  size: number;
  /** Falso com movimento reduzido: a cena fica parada. */
  animate: boolean;
};

export const SkiaPlanetCanvas = ({ size, animate }: SkiaPlanetCanvasProps) => {
  const clock = useSharedValue(0);

  useEffect(() => {
    if (!animate) {
      cancelAnimation(clock);
      clock.value = 0;
      return undefined;
    }
    clock.value = 0;
    clock.value = withRepeat(withTiming(1, { duration: CLOCK_MS, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(clock);
  }, [animate, clock]);

  const scale = size / PLANET_ARTBOARD;
  const bleed = BLEED * scale;

  // Brilho que pulsa devagar em volta do planeta.
  const glowOpacity = useDerivedValue(() => 0.7 + 0.2 * Math.sin(phaseOf(clock.value, CYCLE.glow) * TAU));

  // Reflexo que corre ao longo do anel: dá a sensação de que ele gira.
  const ringShine = useDerivedValue((): Transforms3d => [{ rotate: phaseOf(clock.value, CYCLE.ring) * TAU }]);

  // Superfície: as crateras deslizam por trás do recorte da esfera.
  const surface = useDerivedValue((): Transforms3d => [{ translateX: -phaseOf(clock.value, CYCLE.surface) * SPAN }]);

  // Lua em órbita inclinada como o anel; na metade de trás, passa por trás do planeta.
  const moonAngle = useDerivedValue(() => 2.4 + phaseOf(clock.value, CYCLE.moon) * TAU);
  const moonTransform = useDerivedValue((): Transforms3d => {
    const t = moonAngle.value;
    const point = ringPoint(MOON_ORBIT.rx * Math.cos(t), MOON_ORBIT.ry * Math.sin(t));
    const depth = 0.88 + 0.16 * Math.sin(t);
    return [{ translateX: point.x }, { translateY: point.y }, { scale: depth }];
  });
  const moonBack = useDerivedValue(() => (Math.sin(moonAngle.value) < 0 ? 1 : 0));
  const moonFront = useDerivedValue(() => (Math.sin(moonAngle.value) < 0 ? 0 : 1));

  // Estrela cadente: atravessa o canto de cima a cada ciclo e some no resto do tempo.
  const meteorProgress = useDerivedValue(() => phaseOf(clock.value, CYCLE.meteor) / 0.22);
  const meteorOpacity = useDerivedValue(() => {
    const p = meteorProgress.value;
    return p >= 1 ? 0 : Math.sin(Math.PI * p);
  });
  const meteorTransform = useDerivedValue((): Transforms3d => {
    const p = Math.min(meteorProgress.value, 1);
    return [{ translateX: 236 - 64 * p }, { translateY: 14 + 40 * p }, { rotate: (150 * Math.PI) / 180 }];
  });

  // Asteroides boiando e girando devagar.
  const rockA = useDerivedValue((): Transforms3d => {
    const a = phaseOf(clock.value, CYCLE.rocks) * TAU;
    return [{ translateX: 249 }, { translateY: 226 + 3 * Math.sin(a) }, { rotate: 0.3 + 0.25 * Math.sin(a) }];
  });
  const rockB = useDerivedValue((): Transforms3d => {
    const a = phaseOf(clock.value, CYCLE.rocks) * TAU;
    return [{ translateX: 236 }, { translateY: 40 + 3 * Math.cos(a) }, { rotate: -0.4 + 0.3 * Math.cos(a) }];
  });

  return (
    <Canvas style={{ position: "absolute", left: -bleed, top: -bleed, width: size + bleed * 2, height: size + bleed * 2 }}>
      <Group transform={[{ scale }, { translateX: BLEED }, { translateY: BLEED }]}>
        <Group opacity={glowOpacity}>
          <Circle cx={cx} cy={cy} r={r + 8} color={planetColors.glow}>
            <BlurMask blur={36} style="normal" />
          </Circle>
        </Group>

        {SPARKLES.map((sparkle) => (
          <Sparkle key={`${sparkle.x}-${sparkle.y}`} clock={clock} {...sparkle} />
        ))}

        <Group transform={meteorTransform} opacity={meteorOpacity}>
          <Path path="M0 0 L46 0" style="stroke" strokeWidth={2} strokeCap="round">
            <LinearGradient start={vec(0, 0)} end={vec(46, 0)} colors={[cosmicColors.text, `${planetColors.ring}00`]} />
          </Path>
          <Circle cx={0} cy={0} r={2.5} color={cosmicColors.text}>
            <BlurMask blur={3} style="solid" />
          </Circle>
        </Group>

        <Ring half="back" shine={ringShine} />
        <Group opacity={moonBack}>
          <Moon transform={moonTransform} />
        </Group>

        <Circle cx={cx} cy={cy} r={r}>
          <RadialGradient
            c={vec(cx - r * 0.42, cy - r * 0.5)}
            r={r * 2.05}
            colors={[planetColors.light, planetColors.surface, planetColors.relief, planetColors.shadow]}
            positions={[0, 0.3, 0.68, 1]}
          />
        </Circle>
        <Group clip={Skia.RRectXY(Skia.XYWHRect(cx - r, cy - r, r * 2, r * 2), r, r)}>
          <Group transform={surface}>
            {[0, SPAN].map((offset) =>
              CRATERS.map((crater) => (
                <Oval
                  key={`${offset}-${crater.x}`}
                  x={cx - r + crater.x + offset - crater.rx}
                  y={crater.y - crater.ry}
                  width={crater.rx * 2}
                  height={crater.ry * 2}
                  color={crater.color}
                  opacity={crater.opacity}
                />
              )),
            )}
          </Group>
          {/* Sombra do lado oposto à luz, para a esfera ganhar volume por cima das crateras. */}
          <Circle cx={cx} cy={cy} r={r}>
            <RadialGradient
              c={vec(cx - r * 0.35, cy - r * 0.45)}
              r={r * 2}
              colors={[`${planetColors.night}00`, `${planetColors.night}00`, `${planetColors.night}80`]}
              positions={[0, 0.45, 1]}
            />
          </Circle>
        </Group>
        <Circle cx={cx} cy={cy} r={r - 1} style="stroke" strokeWidth={2} color={planetColors.border} opacity={0.7} />

        <Ring half="front" shine={ringShine} />
        <Group opacity={moonFront}>
          <Moon transform={moonTransform} />
        </Group>

        <Group transform={rockA}>
          <Rock rx={13} ry={10} />
        </Group>
        <Group transform={rockB}>
          <Rock rx={9} ry={7} />
        </Group>
      </Group>
    </Canvas>
  );
};

type Transform = SharedValue<Transforms3d>;

/** Metade do anel. A de trás é desenhada antes da esfera, e a da frente, depois. */
const Ring = ({ half, shine }: { half: "back" | "front"; shine: Transform }) => {
  const pad = RING.width;
  const clip = Skia.XYWHRect(-RING.rx - pad, half === "back" ? -RING.ry - pad : 0, (RING.rx + pad) * 2, RING.ry + pad);
  return (
    <Group transform={[{ translateX: RING.cx }, { translateY: RING.cy }, { rotate: RING.angle }]} clip={clip}>
      <Oval
        x={-RING.rx}
        y={-RING.ry}
        width={RING.rx * 2}
        height={RING.ry * 2}
        style="stroke"
        strokeWidth={RING.width}
        opacity={half === "back" ? 0.8 : 1}
      >
        <SweepGradient
          c={vec(0, 0)}
          transform={shine}
          colors={[planetColors.ring, planetColors.ringHighlight, planetColors.ring, planetColors.light, planetColors.ring]}
        />
      </Oval>
      {/* Brilho suave do anel: a única luz além do planeta. */}
      <Oval x={-RING.rx} y={-RING.ry} width={RING.rx * 2} height={RING.ry * 2} style="stroke" strokeWidth={RING.width} color={planetColors.ring} opacity={0.35}>
        <BlurMask blur={6} style="outer" />
      </Oval>
      {half === "front" ? (
        <Oval
          x={-RING.rx + 8}
          y={-RING.ry + 3}
          width={(RING.rx - 8) * 2}
          height={(RING.ry - 3) * 2}
          style="stroke"
          strokeWidth={1.5}
          color={planetColors.ringHighlight}
          opacity={0.8}
        />
      ) : null}
    </Group>
  );
};

const Moon = ({ transform }: { transform: Transform }) => (
  <Group transform={transform}>
    <Circle cx={0} cy={0} r={MOON_ORBIT.r + 4} color={planetColors.glow} opacity={0.45}>
      <BlurMask blur={8} style="normal" />
    </Circle>
    <Circle cx={0} cy={0} r={MOON_ORBIT.r}>
      <RadialGradient
        c={vec(-MOON_ORBIT.r * 0.3, -MOON_ORBIT.r * 0.4)}
        r={MOON_ORBIT.r * 1.7}
        colors={[planetColors.light, planetColors.relief, planetColors.shadow]}
        positions={[0, 0.45, 0.8]}
      />
    </Circle>
    <Oval x={-6} y={2} width={7} height={5} color={planetColors.shadow} opacity={0.5} />
  </Group>
);

const Rock = ({ rx, ry }: { rx: number; ry: number }) => (
  <Oval x={-rx} y={-ry} width={rx * 2} height={ry * 2}>
    <LinearGradient start={vec(-rx, -ry)} end={vec(rx, ry)} colors={[planetColors.relief, planetColors.night]} />
  </Oval>
);

type SparkleProps = { clock: SharedValue<number>; x: number; y: number; s: number; phase: number };

const Sparkle = ({ clock, x, y, s, phase }: SparkleProps) => {
  const opacity = useDerivedValue(() => 0.3 + 0.7 * (0.5 + 0.5 * Math.sin((phaseOf(clock.value, 3) + phase) * TAU)));
  return (
    <Group transform={[{ translateX: x }, { translateY: y }, { scale: s }]} opacity={opacity}>
      <Path path={STAR} color={cosmicColors.focus} />
    </Group>
  );
};
