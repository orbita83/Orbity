import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const RootLayout = () => {
  return <SafeAreaProvider><StatusBar style="light" /><Stack screenOptions={{ headerShown: false }} /></SafeAreaProvider>;
};

export default RootLayout;
