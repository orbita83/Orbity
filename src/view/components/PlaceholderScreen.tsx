import { ScrollView, StyleSheet, Text, View } from "react-native";
import { themes } from "../theme/tokens";

type PlaceholderScreenProps = {
  title: string;
  message: string;
};

export const PlaceholderScreen = ({ title, message }: PlaceholderScreenProps) => (
  <ScrollView
    style={styles.screen}
    contentContainerStyle={styles.content}
  >
    <View style={styles.messageGroup}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  screen: {
    backgroundColor: themes.cosmic.color.surface,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: themes.cosmic.space.md,
  },
  messageGroup: {
    gap: themes.cosmic.space.sm,
  },
  title: {
    ...themes.cosmic.font.title,
    color: themes.cosmic.color["on-surface"],
  },
  message: {
    ...themes.cosmic.font.body,
    color: themes.cosmic.color["on-surface-variant"],
  },
});
