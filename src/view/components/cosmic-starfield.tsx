import { useId } from "react";
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { cosmicTokens as t } from "../theme/tokens";

// Distribuição determinística: não muda ao atualizar a sequência ou o painel.
const STARS = Array.from({ length: t.planet.starCount }, (_, index) => ({
  x: ((index * 379 + 137) % 997) / 997,
  y: ((index * 541 + 67) % 991) / 991,
  radius: index % 7 === 0 ? 1 : 0.5,
  opacity: index % 3 === 0 ? 0.7 : 0.3,
}));

export const CosmicStarfield = ({ width, height }: { width: number; height: number }) => {
  const glowId = `space-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${Math.max(1, width)} ${Math.max(1, height)}`} accessible={false}>
      <Defs>
        <RadialGradient id={glowId}>
          <Stop offset="0" stopColor={t.planet.color.glow} stopOpacity="0.22" />
          <Stop offset="1" stopColor={t.planet.color.glow} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={t.color.background} />
      <Ellipse cx={width * 0.5} cy={height * 0.66} rx={width * 0.75} ry={height * 0.32} fill={`url(#${glowId})`} />
      {STARS.map((star, index) => <Circle key={index} cx={star.x * width} cy={star.y * height} r={star.radius} fill={index % 4 === 0 ? t.planet.color.rim : t.color.text} opacity={star.opacity} />)}
      {[[0.21, 0.43], [0.78, 0.2], [0.55, 0.73], [0.91, 0.61]].map(([x, y], index) => <Path key={index} d="M0-4 1-1 4 0 1 1 0 4-1 1-4 0-1-1Z" transform={`translate(${x * width} ${y * height})`} fill={t.planet.color.rim} opacity="0.8" />)}
    </Svg>
  );
};
