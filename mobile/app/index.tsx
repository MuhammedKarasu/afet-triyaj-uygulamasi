import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandMark } from "@/components/ui";
import { colors } from "@/src/theme";
import { useApp } from "@/src/store";

export default function SplashRoute() {
  const { ready, user } = useApp();
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => router.replace(user ? "/(tabs)" : "/login"), 950);
    return () => clearTimeout(timer);
  }, [ready, user]);

  return <SafeAreaView style={styles.screen}><View style={styles.glow}/><View style={styles.center}><View style={styles.logoPlaceholder}><BrandMark inverse/></View><Text style={styles.caption}>Acil durumlarda hızlı karar, koordineli müdahale.</Text></View><View style={styles.footer}><ActivityIndicator color="rgba(255,255,255,.75)"/><Text style={styles.version}>V3.0 • MOBİL SAHA SÜRÜMÜ</Text></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary, padding: 28, overflow: "hidden" },
  glow: { position: "absolute", width: 380, height: 380, borderRadius: 190, backgroundColor: "rgba(255,255,255,.06)", right: -170, top: -80 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 26 },
  logoPlaceholder: { minWidth: 260, alignItems: "center" },
  caption: { color: "rgba(255,255,255,.76)", textAlign: "center", maxWidth: 280, fontSize: 14, lineHeight: 22 },
  footer: { alignItems: "center", gap: 12, paddingBottom: 12 },
  version: { color: "rgba(255,255,255,.5)", fontSize: 9, fontWeight: "700", letterSpacing: 1.2 },
});
