import { useId } from "react";
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";
import type { PlanetFocusStage } from "../../viewmodel/useFocusSessionViewModel";
import { cosmicColors, planetColors } from "../theme/tokens";

/** Proporção altura/largura da arte do planeta (constante da ilustração, não token). */
export const PLANET_ASPECT_RATIO = 1;

/** Lado da grade de desenho, igual ao componente "Planeta da sequência" do protótipo (280 × 280). */
export const PLANET_ARTBOARD = 280;
/** Centro e raio da esfera na grade de desenho; o contador da sequência fica centrado nela. */
export const PLANET_SPHERE = { cx: 140, cy: 140, r: 96 } as const;

export type PlanetIllustrationProps = {
  /** Ativa a aura orbital exclusiva durante uma sessão do Modo Foco (RN-0006 CA-01). */
  focusActive?: boolean;
  /** Estágio progressivo de evolução visual durante a sessão ativa (RN-0006 CA-02, CA-03). */
  focusStage?: PlanetFocusStage;
};

// Camadas do protótipo do Claude Design: brilho, anel de trás, esfera com crateras,
// metade da frente do anel, lua e dois asteroides. Tudo vetorial, sem imagem.
export const PlanetIllustration = ({ focusActive = false, focusStage = 0 }: PlanetIllustrationProps = {}) => {
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `planet-${instanceId}-${name}`;
  const paint = (name: string) => `url(#${id(name)})`;
  const color = planetColors;
  const { cx, cy, r } = PLANET_SPHERE;
  // Anel: elipse 280 × 72 com traço de 9, girada -16° em torno do próprio centro.
  const ring = { cx: 140, cy: 148, rx: 135.5, ry: 31.5, angle: -16 };
  const ringTransform = `rotate(${ring.angle} ${ring.cx} ${ring.cy})`;
  const frontArc = `M${ring.cx - ring.rx} ${ring.cy}a${ring.rx} ${ring.ry} 0 0 0 ${ring.rx * 2} 0`;
  const highlightArc = `M${ring.cx - 120} ${ring.cy + 13}a133 29 0 0 0 240 0`;
  const showFocusEvolution = focusActive && focusStage > 0;

  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${PLANET_ARTBOARD} ${PLANET_ARTBOARD}`} accessible={false}>
      <Defs>
        <RadialGradient id={id("glow")} cx="50%" cy="50%" r="50%">
          <Stop offset="0.64" stopColor={color.glow} stopOpacity="0.55" />
          <Stop offset="1" stopColor={color.glow} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={id("surface")} cx="34%" cy="28%" fx="34%" fy="28%" r="98%">
          <Stop offset="0" stopColor={color.highlight} />
          <Stop offset="0.16" stopColor={color.light} />
          <Stop offset="0.42" stopColor={color.surface} />
          <Stop offset="0.7" stopColor={color.relief} />
          <Stop offset="0.86" stopColor={color.shadow} />
          <Stop offset="1" stopColor={color.night} />
        </RadialGradient>
        <RadialGradient id={id("moon")} cx="35%" cy="30%" fx="35%" fy="30%" r="80%">
          <Stop offset="0" stopColor={color.light} />
          <Stop offset="0.62" stopColor={color.relief} />
          <Stop offset="1" stopColor={color.shadow} />
        </RadialGradient>
        <RadialGradient id={id("moonGlow")} cx="50%" cy="50%" r="50%">
          <Stop offset="0.78" stopColor={color.glow} stopOpacity="0.45" />
          <Stop offset="1" stopColor={color.glow} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={id("rock")} x1="0" y1="0" x2="100%" y2="100%">
          <Stop offset="0" stopColor={color.relief} />
          <Stop offset="1" stopColor={color.night} />
        </LinearGradient>
        <ClipPath id={id("sphere")}>
          <Circle cx={cx} cy={cy} r={r} />
        </ClipPath>
      </Defs>

      {/* O brilho termina dentro da grade de 280: passar dela recortaria um quadrado visível. */}
      <Circle cx={cx} cy={cy} r={140} fill={paint("glow")} />

      {showFocusEvolution ? (
        <G testID="planet-focus-aura">
          <Circle
            cx={cx}
            cy={cy}
            r={122}
            fill="none"
            stroke={color.ringHighlight}
            strokeWidth={2}
            strokeDasharray="6 6"
            opacity={0.75}
          />
          {focusStage >= 2 ? (
            <Path
              d={`M${cx - 110} ${cy - 54}a122 122 0 0 1 220 0`}
              fill="none"
              stroke={cosmicColors.unlocked}
              strokeWidth={2.5}
              opacity={0.85}
            />
          ) : null}
          {focusStage >= 3 ? (
            <Path
              d={`M${cx - 110} ${cy + 54}a122 122 0 0 0 220 0`}
              fill="none"
              stroke={cosmicColors.unlocked}
              strokeWidth={2.5}
              opacity={0.85}
            />
          ) : null}
        </G>
      ) : null}

      <Ellipse cx={ring.cx} cy={ring.cy} rx={ring.rx} ry={ring.ry} transform={ringTransform} fill="none" stroke={color.ring} strokeWidth={9} opacity={0.85} />

      <Circle cx={cx} cy={cy} r={r} fill={paint("surface")} />
      <G clipPath={paint("sphere")}>
        <Ellipse cx={101} cy={161} rx={17} ry={11} fill={color.relief} opacity={0.55} />
        <Ellipse cx={181} cy={101} rx={13} ry={9} fill={color.relief} opacity={0.45} />
        <Ellipse cx={179} cy={191} rx={21} ry={13} fill={color.shadow} opacity={0.5} />
        <Ellipse cx={119} cy={86} rx={9} ry={6} fill={color.light} opacity={0.45} />
        <Ellipse cx={204} cy={144} rx={8} ry={6} fill={color.relief} opacity={0.5} />
      </G>
      <Circle cx={cx} cy={cy} r={r - 1} fill="none" stroke={color.border} strokeWidth={2} />

      <G transform={ringTransform}>
        <Path d={frontArc} fill="none" stroke={color.ring} strokeWidth={9} />
        <Path d={highlightArc} fill="none" stroke={color.ringHighlight} strokeWidth={2} opacity={0.8} />
      </G>

      <Circle cx={28} cy={40} r={28} fill={paint("moonGlow")} />
      <Circle cx={28} cy={40} r={22} fill={paint("moon")} />
      <Ellipse cx={249} cy={224} rx={13} ry={10} transform="rotate(18 249 224)" fill={paint("rock")} />
      <Ellipse cx={237} cy={37} rx={9} ry={7} fill={paint("rock")} />

      {/* Atributos orbitais progressivos exclusivos de sessão ativa (RN-0006 CA-02). */}
      {showFocusEvolution ? (
        <G testID={`planet-focus-stage-${focusStage}`}>
          {focusStage >= 1 ? (
            <G>
              <Circle cx={68} cy={44} r={7} fill={color.ringHighlight} opacity={0.35} />
              <Path d="M68 36L70 42L76 44L70 46L68 52L66 46L60 44L66 42Z" fill={cosmicColors.streakFlameCore} />
            </G>
          ) : null}
          {focusStage >= 2 ? (
            <G>
              <Circle cx={212} cy={48} r={7} fill={color.ringHighlight} opacity={0.35} />
              <Path d="M212 40L214 46L220 48L214 50L212 56L210 50L204 48L210 46Z" fill={cosmicColors.streakFlameCore} />
            </G>
          ) : null}
          {focusStage >= 3 ? (
            <G>
              <Circle cx={58} cy={226} r={7} fill={color.ringHighlight} opacity={0.35} />
              <Path d="M58 218L60 224L66 226L60 228L58 234L56 228L50 226L56 224Z" fill={cosmicColors.streakFlameCore} />
            </G>
          ) : null}
          {focusStage >= 4 ? (
            <G>
              <Circle cx={216} cy={232} r={8} fill={cosmicColors.streakFlame} opacity={0.4} />
              <Path d="M216 223L218.5 229.5L225 232L218.5 234.5L216 241L213.5 234.5L207 232L213.5 229.5Z" fill={cosmicColors.streakFlameCore} />
            </G>
          ) : null}
        </G>
      ) : null}
    </Svg>
  );
};
