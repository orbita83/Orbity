import { useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { BackHandler, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlaceholderScreen } from "./PlaceholderScreen";
import { themes, type OrbityTheme } from "../theme/tokens";

export const ProfilePlaceholderScreen = ({ title, theme = themes.cosmic }: { readonly title: string; readonly theme?: OrbityTheme }) => {
  const styles = createStyles(theme);
  const router = useRouter();
  const returnToProfile = useCallback(() => router.replace("/profile"), [router]);
  useFocusEffect(useCallback(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      returnToProfile();
      return true;
    });
    return () => subscription.remove();
  }, [returnToProfile]));
  return <SafeAreaView style={styles.screen}>
    <PlaceholderScreen title={title} message="Esta seção estará disponível em breve." theme={theme} onReturn={returnToProfile} />
  </SafeAreaView>;
};

const createStyles = (theme: OrbityTheme) => StyleSheet.create({ screen: { flex: 1, backgroundColor: theme.color.surface } });
