import { useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useReduceMotion } from "../theme/useReduceMotion";
import { CosmicSkyCanvas } from "./CosmicSkyCanvas";

export type CosmicSkyProps = {
  /** Brilho de fundo da Tela Inicial (radial do painel para o fundo, como no protótipo). */
  glow?: boolean;
};

/**
 * Céu animado atrás do conteúdo da tela (#286): estrelas que cintilam e estrelas cadentes.
 * Decorativo: fora da árvore de acessibilidade e sem receber toques. Fica como primeiro filho
 * da raiz da tela, que mantém o fundo `color.surface`.
 */
export const CosmicSky = ({ glow = false }: CosmicSkyProps) => {
  const reduceMotion = useReduceMotion();
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setFrame((current) => (current.width === width && current.height === height ? current : { width, height }));
  };

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
    >
      {frame.width > 0 ? <CosmicSkyCanvas width={frame.width} height={frame.height} animate={!reduceMotion} glow={glow} /> : null}
    </View>
  );
};
