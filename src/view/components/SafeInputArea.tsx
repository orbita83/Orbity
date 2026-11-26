import type { ReactNode } from "react";
import { KeyboardAvoidingView } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

export type SafeInputAreaProps = {
  children: ReactNode;
  /** Estilo do contêiner. Por padrão ocupa todo o espaço disponível (`flex: 1`). */
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const FILL: ViewStyle = { flex: 1 };

/**
 * Área de formulário que sobe junto com o teclado, para que o campo em edição e o botão de ação
 * não fiquem escondidos atrás dele (WCAG 2.4.11). Envolva o conteúdo das telas de formulário e
 * dos modais com campos de texto. Com o app em tela cheia (edge-to-edge) o Android não redimensiona
 * a janela sozinho, então o `padding` vale nas duas plataformas.
 */
export const SafeInputArea = ({ children, style, testID }: SafeInputAreaProps) => (
  <KeyboardAvoidingView testID={testID} behavior="padding" style={[FILL, style]}>
    {children}
  </KeyboardAvoidingView>
);
