import { useId } from "react";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { cosmicTokens as t } from "../theme/tokens";

// Geometria vetorial em coordenadas locais: esfera, relevo e órbita são camadas
// independentes, sem textura raster ou contexto WebGL.
export const PlanetIllustration = ({ isFocusMode = false }: { isFocusMode?: boolean }) => {
  const instanceId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `planet-${instanceId}-${name}`;
  const paint = (name: string) => `url(#${id(name)})`;
  const color = t.planet.color;

  return (
    <Svg width="100%" height="100%" viewBox="0 0 1000 850" accessible={false}>
      <Defs>
        <RadialGradient id={id("surface")} cx="25%" cy="18%" r="86%">
          <Stop offset="0" stopColor={color.highlight} />
          <Stop offset="0.28" stopColor={color.light} />
          <Stop offset="0.58" stopColor={color.surface} />
          <Stop offset="0.84" stopColor={color.shade} />
          <Stop offset="1" stopColor={color.night} />
        </RadialGradient>
        <RadialGradient id={id("shadow")} cx="15%" cy="10%" r="100%">
          <Stop offset="0.28" stopColor={color.night} stopOpacity="0" />
          <Stop offset="0.7" stopColor={color.night} stopOpacity="0.2" />
          <Stop offset="1" stopColor={color.night} stopOpacity="0.88" />
        </RadialGradient>
        <RadialGradient id={id("glow")}>
          <Stop offset="0.66" stopColor={color.glow} stopOpacity={isFocusMode ? 0.32 : 0.2} />
          <Stop offset="1" stopColor={color.glow} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id={id("ring")} x1="0" y1="0" x2="100%" y2="100%">
          <Stop offset="0" stopColor={color.ringHighlight} />
          <Stop offset="0.35" stopColor={color.ring} />
          <Stop offset="0.7" stopColor={color.light} />
          <Stop offset="1" stopColor={color.ringHighlight} />
        </LinearGradient>
        <LinearGradient id={id("rim")} x1="0" y1="0" x2="100%" y2="100%">
          <Stop offset="0" stopColor={color.ringHighlight} />
          <Stop offset="0.45" stopColor={color.rim} stopOpacity="0.8" />
          <Stop offset="1" stopColor={color.surface} stopOpacity="0.2" />
        </LinearGradient>
        <ClipPath id={id("sphere")}><Circle cx="500" cy="425" r="330" /></ClipPath>
      </Defs>

      <Circle cx="500" cy="425" r="425" fill={paint("glow")} />
      <Ellipse cx="500" cy="425" rx="480" ry="143" transform="rotate(-24 500 425)" fill="none" stroke={paint("ring")} strokeWidth="32" opacity="0.85" />
      <Circle cx="500" cy="425" r="330" fill={paint("surface")} />

      <G clipPath={paint("sphere")}>
        <G fill={color.continent} opacity="0.62">
          <Path d="M243 157c57-33 95-8 117 7 18 13 48-5 69 5 39 20 4 58-24 62-32 4-26 32-50 42-32 13-45-9-71-3-31 7-22 43-49 46-36 5-54-32-41-59 10-21 42-27 38-47-3-15-8-34 11-53Z" />
          <Path d="M462 104c38-11 75-3 99 11 28 17 27 40 65 40 25 0 51-9 72 12 27 29-10 52-37 45-25-7-48-7-65 13-24 26-52 21-58-4-4-21-24-18-46-20-33-3-32-30-14-43 18-14-46-28-16-54Z" />
          <Path d="M657 249c36-27 47 2 73-4 35-7 49-45 74-19 19 20-3 39 1 60 4 23 38 36 31 65-9 32-39 26-59 9-25-20-18-53-45-52-28 2-37 30-64 24-38-8-37-56-11-83Z" />
          <Path d="M463 298c29-35 68-22 75 5 7 24 42 10 58 33 16 24-13 45-39 47-28 3-29 35-52 34-30-2-35-31-61-32-33-2-34-30-13-43 15-9 20-30 32-44Z" />
          <Path d="M210 425c24-22 56-18 66 3 9 20 32 11 46 31 25 34-12 43-8 68 3 21 36 36 23 66-12 29-43 18-45-6-2-22-29-10-39-31-10-22 1-32-16-53-25-31-52-41-27-78Z" />
          <Path d="M572 469c30-35 52-4 71-14 29-15 15-48 49-56 40-10 54 38 36 69-14 23 1 41-12 63-17 30-51 5-61 25-17 36 7 64-19 87-37 32-75-2-58-35 10-18-10-38-30-43-34-9-37-42-15-59 14-11 24-19 39-37Z" />
          <Path d="M387 641c20-24 38-8 56-1 24 8 36-17 58-3 21 14-5 31 14 44 36 25 15 51-13 48-29-3-40 21-68 17-23-4-28-28-15-46 12-17-58-29-32-59Z" />
        </G>
        <G fill={color.shade} opacity="0.38">
          <Ellipse cx="288" cy="339" rx="39" ry="25" transform="rotate(-48 288 339)" />
          <Ellipse cx="375" cy="217" rx="22" ry="12" transform="rotate(-20 375 217)" />
          <Ellipse cx="735" cy="402" rx="22" ry="30" transform="rotate(-18 735 402)" />
          <Ellipse cx="407" cy="545" rx="34" ry="20" transform="rotate(22 407 545)" />
          <Ellipse cx="532" cy="608" rx="18" ry="24" />
        </G>
        <Path d="M266 358c-11-24 11-53 36-57" fill="none" stroke={color.highlight} strokeWidth="5" opacity="0.32" />
        <Circle cx="500" cy="425" r="330" fill={paint("shadow")} />
      </G>

      <Circle cx="500" cy="425" r="329" fill="none" stroke={paint("rim")} strokeWidth={isFocusMode ? 5 : 3} />
      <G transform="rotate(-24 500 425)">
        <Path d="M20 425a480 143 0 0 0 960 0" fill="none" stroke={paint("ring")} strokeWidth="32" />
        <Path d="M20 425a480 143 0 0 0 960 0" fill="none" stroke={color.ringHighlight} strokeWidth="2" opacity="0.72" />
      </G>
    </Svg>
  );
};
