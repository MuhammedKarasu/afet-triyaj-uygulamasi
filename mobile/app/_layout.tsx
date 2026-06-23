import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { AppProvider } from "@/src/store";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  return <SafeAreaProvider>
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: "#F3F7F8" } }}>
        <Stack.Screen name="index" options={{ animation: "fade" }}/>
        <Stack.Screen name="login" options={{ animation: "fade" }}/>
        <Stack.Screen name="(tabs)"/>
        <Stack.Screen name="patient/[id]"/>
        <Stack.Screen name="patient/[id]/intervention" options={{ presentation: "modal", animation: "slide_from_bottom" }}/>
      </Stack>
    </AppProvider>
  </SafeAreaProvider>;
}
