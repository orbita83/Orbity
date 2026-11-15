import { useId } from "react";
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { cosmicColors } from "../theme/tokens";

// Grade do protótipo do Claude Design (cena de 390 × 756 dp, sem a barra de abas).
// As posições viram frações para acompanhar qualquer tamanho de tela.
const GRID = { width: 390, height: 756 } as const;

const DOTS: readonly { x: number; y: number; size: 2 | 3; accent: boolean; opacity: number }[] = [
  { x: 34, y: 120, size: 2, accent: false, opacity: 0.7 },
  { x: 92, y: 182, size: 3, accent: true, opacity: 0.8 },
  { x: 318, y: 146, size: 2, accent: false, opacity: 0.6 },
  { x: 352, y: 238, size: 3, accent: false, opacity: 0.9 },
  { x: 22, y: 318, size: 2, accent: true, opacity: 0.7 },
  { x: 60, y: 520, size: 3, accent: false, opacity: 0.6 },
  { x: 340, y: 470, size: 2, accent: false, opacity: 0.8 },
  { x: 300, y: 600, size: 3, accent: true, opacity: 0.6 },
  { x: 140, y: 640, size: 2, accent: false, opacity: 0.5 },
  { x: 210, y: 108, size: 2, accent: false, opacity: 0.6 },
];

const SPARKLES: readonly { x: number; y: number; size: number; accent: boolean; opacity: number }[] = [
  { x: 172, y: 140, size: 14, accent: true, opacity: 1 },
  { x: 340, y: 330, size: 16, accent: false, opacity: 0.85 },
  { x: 40, y: 430, size: 12, accent: true, opacity: 1 },
];

/** Estrela de quatro pontas na grade 24 × 24, como no protótipo. */
const SPARKLE_PATH = "M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z";

export const CosmicStarfield = ({ width, height }: { width: number; height: number }) => {
  const baseId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sx = width / GRID.width;
  const sy = height / GRID.height;
  const at = (x: number, y: number) => ({ x: x * sx, y: y * sy });
  const tail = at(250, 112);
  const head = at(333, 112);

  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${Math.max(1, width)} ${Math.max(1, height)}`} accessible={false}>
      <Defs>
        {/* radial-gradient(120% 70% at 50% 35%, sheet 0%, background 70%) do protótipo */}
        <RadialGradient id={`${baseId}-sky`} cx={width / 2} cy={height * 0.35} rx={width * 1.2} ry={height * 0.7} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={cosmicColors.sheet} />
          <Stop offset="0.7" stopColor={cosmicColors.background} />
        </RadialGradient>
        <LinearGradient id={`${baseId}-meteor`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={cosmicColors.focus} stopOpacity="0" />
          <Stop offset="1" stopColor={cosmicColors.focus} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${baseId}-sky)`} />
      {DOTS.map((dot, index) => {
        const { x, y } = at(dot.x, dot.y);
        return <Circle key={index} cx={x + dot.size / 2} cy={y + dot.size / 2} r={dot.size / 2} fill={dot.accent ? cosmicColors.focus : cosmicColors.text} opacity={dot.opacity} />;
      })}
      {SPARKLES.map((sparkle, index) => {
        const { x, y } = at(sparkle.x, sparkle.y);
        return (
          <Path
            key={index}
            d={SPARKLE_PATH}
            transform={`translate(${x} ${y}) scale(${sparkle.size / 24})`}
            fill={sparkle.accent ? cosmicColors.focus : cosmicColors.text}
            opacity={sparkle.opacity}
          />
        );
      })}
      {/* Estrela cadente: rastro de 84 dp girado -32° a partir da cabeça. */}
      <Rect
        x={head.x - 84}
        y={head.y - 1}
        width={84}
        height={2}
        rx={1}
        fill={`url(#${baseId}-meteor)`}
        transform={`rotate(-32 ${head.x} ${head.y})`}
      />
      <Circle cx={head.x + 3} cy={tail.y} r={6} fill={cosmicColors.focus} opacity={0.35} />
      <Circle cx={head.x + 3} cy={tail.y} r={3} fill={cosmicColors.text} />
    </Svg>
  );
};
