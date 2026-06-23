import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen, Card, InfoRow, PrimaryButton, RiskBadge, SectionTitle, StatusBadge, uiStyles } from "@/components/ui";
import { colors, RISK_META, STATUS_META } from "@/src/theme";
import { useApp } from "@/src/store";

const gender = { FEMALE: "Kadın", MALE: "Erkek", OTHER: "Diğer / Bilinmiyor" } as const;
const consciousness = { ALERT: "Açık / Uyanık", CONFUSED: "Bulanık", UNCONSCIOUS: "Kapalı" } as const;
const bleeding = { NONE: "Yok", MODERATE: "Kontrollü", SEVERE: "Şiddetli" } as const;
const respiratory = { NORMAL: "Normal", DIFFICULT: "Solunum güçlüğü", NONE: "Solunum yok" } as const;
const formatDate = (value: string) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { patients } = useApp();
  const patient = patients.find((item) => item.id === id);
  if (!patient) return <AppScreen scroll={false} contentStyle={{ justifyContent: "center" }}><View style={{ gap: 16 }}><Text style={styles.notFound}>Kayıt bulunamadı</Text><PrimaryButton title="Yaralı listesine dön" onPress={() => router.replace("/(tabs)/patients")}/></View></AppScreen>;
  const risk = RISK_META[patient.riskLevel];
  return <AppScreen>
    <View style={styles.nav}><Pressable accessibilityRole="button" accessibilityLabel="Geri dön" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={colors.text}/></Pressable><Text style={styles.navTitle}>Yaralı detayı</Text><View style={{ width: 42 }}/></View>
    <Card style={[styles.hero, { borderTopColor: risk.color }]}><View style={uiStyles.wrap}><RiskBadge level={patient.riskLevel}/><StatusBadge status={patient.interventionStatus}/></View><Text style={styles.name}>{patient.fullName}</Text><Text style={styles.summary}>{patient.age} yaş • {gender[patient.gender]} • {patient.locationDescription}</Text></Card>
    <Card><SectionTitle icon="person-outline" title="Temel Bilgiler"/><InfoRow label="Ad Soyad" value={patient.fullName}/><InfoRow label="Yaş / Cinsiyet" value={`${patient.age} / ${gender[patient.gender]}`}/><InfoRow label="Kimlik bilgisi" value={patient.identityNumber || "Bilgi girilmedi"}/><InfoRow label="Kayıt" value={`${formatDate(patient.createdAt)} • ${patient.createdBy}`}/></Card>
    <Card><SectionTitle icon="pulse-outline" title="Hayati Bulgular"/><View style={styles.vitals}><Vital label="Nabız" value={`${patient.pulse}/dk`} alert={patient.pulse > 130}/><Vital label="SpO₂" value={`%${patient.spo2}`} alert={patient.spo2 < 90}/></View><View style={uiStyles.divider}/><InfoRow label="Solunum" value={respiratory[patient.respiratoryStatus]}/><InfoRow label="Bilinç" value={consciousness[patient.consciousness]}/><InfoRow label="Kanama" value={bleeding[patient.bleeding]}/><InfoRow label="Hareket" value={patient.canWalk ? "Yürüyebiliyor" : "Yürüyemiyor"}/><InfoRow label="Yaşam belirtisi" value={patient.hasLifeSigns ? "Var" : "Yok"}/></Card>
    <Card style={{ borderColor: risk.color + "44" }}><SectionTitle icon="analytics-outline" title="Risk Analizi" caption={risk.description}/><RiskBadge level={patient.riskLevel}/><Text style={styles.reason}>{patient.riskReason}</Text></Card>
    <Card><SectionTitle icon="medkit-outline" title="Müdahale Bilgileri"/><View style={styles.statusRow}><View><Text style={styles.infoSmall}>GÜNCEL DURUM</Text><Text style={[styles.statusValue, { color: STATUS_META[patient.interventionStatus].color }]}>{STATUS_META[patient.interventionStatus].label}</Text></View><StatusBadge status={patient.interventionStatus}/></View><PrimaryButton title="Müdahale durumunu güncelle" icon="create-outline" onPress={() => router.push(`/patient/${patient.id}/intervention`)}/>{patient.interventions.length > 0 && <View style={styles.timeline}>{patient.interventions.map((item) => <View key={item.id} style={styles.timelineItem}><View style={styles.timelineDot}/><View style={{ flex: 1 }}><Text style={styles.timelineTitle}>{STATUS_META[item.status].label}</Text><Text style={styles.timelineNote}>{item.note || "Durum güncellendi."}</Text><Text style={styles.timelineTime}>{formatDate(item.createdAt)} • {item.author}</Text></View></View>)}</View>}</Card>
    <Card><SectionTitle icon="location-outline" title="Konum ve Notlar"/><InfoRow icon="navigate-outline" label="Konum" value={patient.locationDescription}/><InfoRow icon="map-outline" label="Koordinat" value={patient.latitude && patient.longitude ? `${patient.latitude.toFixed(5)}, ${patient.longitude.toFixed(5)}` : "Koordinat girilmedi"}/><InfoRow icon="document-text-outline" label="Saha notu" value={patient.notes || "Ek not bulunmuyor"}/></Card>
  </AppScreen>;
}

function Vital({ label, value, alert }: { label: string; value: string; alert: boolean }) { return <View style={[styles.vital, alert && { backgroundColor: colors.redSoft }]}><Text style={[styles.vitalValue, alert && { color: colors.red }]}>{value}</Text><Text style={styles.vitalLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }, navTitle: { color: colors.text, fontSize: 15, fontWeight: "700" }, hero: { borderTopWidth: 4, gap: 10 }, name: { color: colors.text, fontSize: 27, fontWeight: "800", letterSpacing: -.6 }, summary: { color: colors.textMuted, fontSize: 12, lineHeight: 18 }, vitals: { flexDirection: "row", gap: 10 }, vital: { flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: 15, padding: 15 }, vitalValue: { color: colors.text, fontSize: 23, fontWeight: "800" }, vitalLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "700", marginTop: 4 }, reason: { color: colors.text, fontSize: 14, lineHeight: 22, fontWeight: "600", marginTop: 13 }, statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }, infoSmall: { color: colors.textMuted, fontSize: 9, fontWeight: "700", letterSpacing: .8 }, statusValue: { fontSize: 16, fontWeight: "800", marginTop: 4 }, timeline: { gap: 14, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 17, paddingTop: 17 }, timelineItem: { flexDirection: "row", gap: 11 }, timelineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary, marginTop: 5 }, timelineTitle: { color: colors.text, fontSize: 12, fontWeight: "700" }, timelineNote: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 }, timelineTime: { color: "#91A0A3", fontSize: 9, marginTop: 5 }, notFound: { color: colors.text, fontSize: 25, fontWeight: "800", textAlign: "center" },
});
