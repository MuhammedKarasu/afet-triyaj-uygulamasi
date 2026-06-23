import { router } from "expo-router";
import { Text, View } from "react-native";
import { AppScreen, BrandMark, PrimaryButton } from "@/components/ui";
import { colors } from "@/src/theme";

export default function NotFound() {
  return <AppScreen scroll={false} contentStyle={{ justifyContent: "center" }}><View style={{ gap: 24 }}><BrandMark/><View style={{ gap: 8 }}><Text style={{ color: colors.text, fontSize: 28, fontWeight: "800" }}>Ekran bulunamadı</Text><Text style={{ color: colors.textMuted, lineHeight: 21 }}>Aradığınız mobil ekran mevcut değil.</Text></View><PrimaryButton title="Ana sayfaya dön" icon="home-outline" onPress={() => router.replace("/(tabs)")}/></View></AppScreen>;
}
