import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/src/theme";
import { useApp } from "@/src/store";

const icons = { index: "home", new: "add-circle", patients: "heart", teams: "people", profile: "person" } as const;

export default function TabLayout() {
  const { ready, user } = useApp();
  if (!ready) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator color={colors.primary}/></View>;
  if (!user) return <Redirect href="/login"/>;

  return <Tabs screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: "#829397",
    tabBarStyle: { height: 84, paddingTop: 8, paddingBottom: 18, borderTopColor: colors.border, backgroundColor: colors.white },
    tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
    tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? icons[route.name as keyof typeof icons] : `${icons[route.name as keyof typeof icons]}-outline` as keyof typeof Ionicons.glyphMap} size={route.name === "new" ? 28 : 23} color={color}/>,
  })}>
    <Tabs.Screen name="index" options={{ title: "Ana Sayfa" }}/>
    <Tabs.Screen name="new" options={{ title: "Kayıt Ekle" }}/>
    <Tabs.Screen name="patients" options={{ title: "Yaralılar" }}/>
    <Tabs.Screen name="teams" options={{ title: "Ekipler" }}/>
    <Tabs.Screen name="profile" options={{ title: "Profil" }}/>
  </Tabs>;
}
