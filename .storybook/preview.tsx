import type { Preview } from "@storybook/react-native-web-vite";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { View } from "react-native";
import { themes } from "../src/view/theme/tokens";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Tema do Orbity",
      toolbar: {
        title: "Tema",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Claro" },
          { value: "dark", title: "Escuro" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "fullscreen",
    controls: { expanded: true },
  },
  decorators: [
    (Story, context) => {
      const theme = themes[context.globals.theme === "dark" ? "dark" : "light"];
      return (
        <View
          style={{
            backgroundColor: theme.color.surface,
            padding: theme.space.lg,
            minHeight: "100%",
          }}
        >
          <Story />
        </View>
      );
    },
  ],
};

export default preview;
