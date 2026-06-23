import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen, BrandMark, Field, PrimaryButton } from "@/components/ui";
import { colors, radius } from "@/src/theme";
import { useApp } from "@/src/store";

export default function LoginScreen() {
  const { login, loginDemo } = useApp();
  const [email, setEmail] = useState("admin@afet.local");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true); setError("");
    const accepted = await login(email, password);
    setLoading(false);
    if (accepted) router.replace("/(tabs)");
    else setError("E-posta veya parola hatalı.");
  }

  async function demo() { await loginDemo(); router.replace("/(tabs)"); }

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <AppScreen contentStyle={styles.content}>
      <BrandMark/>
      <View style={styles.illustration}>
        <View style={styles.illustrationIcon}><Ionicons name="shield-checkmark-outline" size={54} color={colors.primary}/></View>
        <Text style={styles.placeholderTitle}>Giriş illüstrasyonu alanı</Text>
        <Text style={styles.placeholderText}>1600 × 2000 oranındaki tasarımınız için hazır yerleşim</Text>
      </View>
      <View style={styles.heading}><Text style={styles.title}>Sahaya güvenle bağlanın</Text><Text style={styles.description}>Yaralı kayıtlarını, triyaj önceliklerini ve ekip akışını tek yerden yönetin.</Text></View>
      <View style={styles.form}><Field label="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/><Field label="Parola" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" error={error}/><PrimaryButton title="Giriş yap" onPress={submit} loading={loading}/></View>
      <Pressable accessibilityRole="button" onPress={demo} style={styles.demoButton}><Ionicons name="flash-outline" size={18} color={colors.primary}/><View style={{ flex: 1 }}><Text style={styles.demoTitle}>Demo kullanıcı ile devam et</Text><Text style={styles.demoText}>Admin yetkileri ve hazır saha verileri</Text></View><Ionicons name="chevron-forward" size={18} color={colors.primary}/></Pressable>
      <Text style={styles.disclaimer}>Bu uygulama tıbbi teşhis sistemi değildir. Eğitim ve karar destek amacıyla kullanılır.</Text>
    </AppScreen>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 34 },
  illustration: { minHeight: 220, borderRadius: radius.lg, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: "#CBEADF", alignItems: "center", justifyContent: "center", padding: 24, marginTop: 8 },
  illustrationIcon: { width: 96, height: 96, borderRadius: 30, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", marginBottom: 15 },
  placeholderTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  placeholderText: { color: colors.textMuted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 5, maxWidth: 250 },
  heading: { gap: 8, marginTop: 4 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -.7 },
  description: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  form: { gap: 14 },
  demoButton: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: radius.md, paddingHorizontal: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  demoTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  demoText: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  disclaimer: { color: colors.textMuted, fontSize: 10, lineHeight: 16, textAlign: "center", paddingHorizontal: 18 },
});
