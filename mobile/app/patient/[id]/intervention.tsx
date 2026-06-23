import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppScreen, Card, Field, PrimaryButton, RiskBadge, StatusBadge } from "@/components/ui";
import { SegmentedControl } from "@/components/SegmentedControl";
import { colors } from "@/src/theme";
import { useApp } from "@/src/store";
import type { InterventionStatus } from "@/src/types";

export default function InterventionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patients, updateIntervention } = useApp();
  const patient = patients.find((item) => item.id === id);
  const [status, setStatus] = useState<InterventionStatus>(patient?.interventionStatus ?? "WAITING");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  if (!patient) return null;

  async function save() {
    setSaving(true);
    try { await updateIntervention(id, status, note.trim()); router.back(); }
    catch { Alert.alert("Güncelleme tamamlanamadı", "Lütfen yeniden deneyin."); }
    finally { setSaving(false); }
  }

  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><AppScreen>
    <View style={styles.nav}><Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={22} color={colors.text}/></Pressable><Text style={styles.navTitle}>Müdahale güncelle</Text><View style={{ width: 42 }}/></View>
    <View><Text style={styles.eyebrow}>YARALI KAYDI</Text><Text style={styles.title}>{patient.fullName}</Text><View style={styles.badges}><RiskBadge level={patient.riskLevel}/><StatusBadge status={patient.interventionStatus}/></View></View>
    <Card style={{ gap: 20 }}><SegmentedControl scroll label="Yeni müdahale durumu" value={status} onChange={setStatus} options={[{ label: "Bekliyor", value: "WAITING" }, { label: "Müdahale Ediliyor", value: "IN_PROGRESS" }, { label: "Müdahale Edildi", value: "COMPLETED" }, { label: "Sevk Edildi", value: "TRANSFERRED" }]}/><Field label="Müdahale notu" value={note} onChangeText={setNote} multiline placeholder="Uygulanan işlem ve saha gözlemleri..."/><View style={styles.helper}><Ionicons name="information-circle-outline" size={19} color={colors.blue}/><Text style={styles.helperText}>Güncelleme cihazda saklanır ve yaralının müdahale geçmişine eklenir.</Text></View></Card>
    <PrimaryButton title="Durumu kaydet" icon="checkmark" loading={saving} onPress={save}/>
  </AppScreen></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, close: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }, navTitle: { color: colors.text, fontSize: 15, fontWeight: "700" }, eyebrow: { color: colors.primary, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 }, title: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 5 }, badges: { flexDirection: "row", gap: 7, marginTop: 11 }, helper: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 13, borderRadius: 14, backgroundColor: colors.blueSoft }, helperText: { flex: 1, color: colors.blue, fontSize: 11, lineHeight: 17 } });
