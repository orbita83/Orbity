import Svg, { Circle, Path } from "react-native-svg";
import { cosmicTokens as t } from "../theme/tokens";

export type CosmicIconName = "home" | "tasks" | "target" | "star" | "person" | "settings" | "timer" | "play" | "chevron" | "up" | "close" | "chart" | "help" | "rocket" | "trophy" | "flame" | "lock" | "check";

type CosmicIconProps = { name: CosmicIconName; color?: string; size?: number; filled?: boolean };

export const CosmicIcon = ({ name, color = t.color.icon, size = t.layout.iconSize, filled = false }: CosmicIconProps) => {
  const paths: Partial<Record<CosmicIconName, string>> = {
    home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    tasks: "M14 3H5v18h14V8Zm0 0v5h5M8 12h8M8 15h8M8 18h5",
    person: "M20 21H4v-2a8 6 0 0 1 16 0ZM16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    settings: "m9 3 .6-1h4.8l.6 3 2 .9 2.5-1 2.2 3.8-2 2v2.6l2 2-2.2 3.8-2.5-1-2 .9-.6 3H9.6l-.6-3-2-.9-2.5 1-2.2-3.8 2-2v-2.6l-2-2L4.5 5l2.5 1 2-.9Z",
    timer: "M9 2h6M12 2v3m6 1 1.5-1.5M12 9v5l3 2M21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    play: "m8 4 12 8-12 8Z",
    chevron: "m9 5 6 7-6 7",
    up: "m4 15 8-8 8 8",
    close: "m6 6 12 12M6 18 18 6",
    star: "m12 2 3 6.5 7 .9-5.2 5 1.3 7.1-6.1-3.4-6.1 3.4 1.3-7.1L2 9.4l7-.9Z",
    chart: "M8 16v-3m4 3V9m4 7V6M5 2h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3",
    help: "M9.1 8a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 17h.01",
    rocket: "M9 15 5 19l1-6m3 2 3 3m-3-3 2-7c3-4 9-5 9-5s0 6-4 10l-7 2Zm3 3 6-1-4 4M5 20l-2 1 1-3",
    trophy: "M7 3h10v7a5 5 0 0 1-10 0V3Zm0 2H3v3a5 5 0 0 0 5 5m9-8h4v3a5 5 0 0 1-5 5m-4 2v6m-5 0h10",
    lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v12H5ZM12 15v3",
    check: "m5 12 4 4L20 5",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" accessible={false}>
      {name === "target" ? <><Circle cx="11" cy="13" r="9" /><Circle cx="11" cy="13" r="5.5" /><Path d="m11 13 8-9m-1-2 1 3 3 1" /><Circle cx="11" cy="13" r="1.5" fill={color} stroke="none" /></> : null}
      {name === "flame" ? <><Path d="M13 1c2 6-1 7 2 10 2-1 3-3 3-5 4 5 5 8 3 12a9 9 0 0 1-17-1c-1-4 1-7 4-10-1 4 1 5 2 5 3-3-1-7 3-11Z" fill={t.color.flame} stroke="none" /><Path d="M12 12c2 4-1 4 2 7 1-1 2-3 2-4 3 4 1 8-3 8-5 0-7-5-1-11Z" fill={t.color.flameCore} stroke="none" /></> : null}
      {name === "settings" ? <Circle cx="12" cy="12" r="3" /> : null}
      {name === "help" ? <Circle cx="12" cy="12" r="10" /> : null}
      {name === "rocket" ? <Circle cx="15" cy="8" r="2" /> : null}
      {paths[name] ? <Path d={paths[name]} fill={filled || name === "play" ? color : "none"} /> : null}
    </Svg>
  );
};
