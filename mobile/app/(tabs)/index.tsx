import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen, BrandMark, Card, MetricCard, PageTitle, PrimaryButton, RiskBadge, StatusBadge, uiStyles } from "@/components/ui";
import { colors, RISK_META } from "@/src/theme";
import { useApp } from "@/src/store";

export default function DashboardScreen() {
  const { patients, user } = useApp();
  const count = (predicate: (patient: (typeof patients)[number]) => boolean) => patients.filter(predicate).length;
  const recent = [...patients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
  const urgent = patients.filter((patient) => patient.riskLevel === "RED" && ["WAITING", "IN_PROGRESS"].includes(patient.interventionStatus));

  return <AppScreen>
    <View style={styles.brandBar}><BrandMark compact/><View style={styles.live}><View style={styles.liveDot}/><Text style={styles.liveText}>ÇEVRİMDIŞI HAZIR</Text></View></View>
    <PageTitle eyebrow="SAHA KONTROL MERKEZİ" title={`Merhaba, ${user?.name.split(" ")[0] ?? ""}`} description="Güncel triyaj ve müdahale durumunu tek bakışta izleyin."/>
    <PrimaryButton title="Hızlı yaralı kaydı" icon="add" onPress={() => router.push("/(tabs)/new")}/>
    <View style={styles.metrics}>
      <MetricCard label="Toplam yaralı" value={patients.length} icon="heart-outline" tone="primary"/>
      <MetricCard label="Kırmızı risk" value={count((p) => p.riskLevel === "RED")} icon="alert-circle-outline" tone="red"/>
      <MetricCard label="Sarı risk" value={count((p) => p.riskLevel === "YELLOW")} icon="warning-outline" tone="amber"/>
      <MetricCard label="Yeşil risk" value={count((p) => p.riskLevel === "GREEN")} icon="checkmark-circle-outline" tone="green"/>
      <MetricCard label="Müdahale bekleyen" value={count((p) => p.interventionStatus === "WAITING")} icon="time-outline" tone="blue"/>
      <MetricCard label="Müdahale edilen" value={count((p) => ["COMPLETED", "TRANSFERRED"].includes(p.interventionStatus))} icon="clipboard-outline" tone="slate"/>
    </View>

    <Card style={styles.urgentCard}><View style={styles.sectionHeader}><View><Text style={uiStyles.heading}>Acil müdahale kuyruğu</Text><Text style={uiStyles.muted}>{urgent.length} aktif kırmızı vaka</Text></View><View style={[styles.urgentCount, { backgroundColor: RISK_META.RED.background }]}><Text style={{ color: RISK_META.RED.color, fontWeight: "800" }}>{urgent.length}</Text></View></View>{urgent.slice(0, 3).map((patient) => <Pressable key={patient.id} onPress={() => router.push(`/patient/${patient.id}`)} style={styles.urgentRow}><View style={styles.urgentLine}/><View style={{ flex: 1 }}><Text style={styles.patientName}>{patient.fullName}</Text><Text style={styles.vitals}>Nabız {patient.pulse} • SpO₂ %{patient.spo2}</Text></View><Ionicons name="chevron-forward" size={17} color="#A6B2B5"/></Pressable>)}</Card>

    <View style={styles.sectionHeader}><View><Text style={uiStyles.heading}>Son kayıtlar</Text><Text style={uiStyles.muted}>En güncel saha girişleri</Text></View><Pressable onPress={() => router.push("/(tabs)/patients")}><Text style={styles.link}>Tümünü gör</Text></Pressable></View>
    {recent.map((patient) => <Pressable key={patient.id} onPress={() => router.push(`/patient/${patient.id}`)} style={styles.recentRow}><View style={{ flex: 1, gap: 7 }}><Text style={styles.patientName}>{patient.fullName}</Text><View style={uiStyles.wrap}><RiskBadge level={patient.riskLevel}/><StatusBadge status={patient.interventionStatus}/></View><Text numberOfLines={1} style={uiStyles.muted}>{patient.locationDescription}</Text></View><Ionicons name="chevron-forward" size={18} color="#A6B2B5"/></Pressable>)}
  </AppScreen>;
}

const styles = StyleSheet.create({
  brandBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  live: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primarySoft, borderRadius: 99, paddingHorizontal: 9, minHeight: 28 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  liveText: { color: colors.primaryDark, fontSize: 8, fontWeight: "800", letterSpacing: .6 },
  metrics: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  urgentCard: { gap: 2, borderColor: "#F4D8DE" },
  urgentCount: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  urgentRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingTop: 14, marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  urgentLine: { width: 4, height: 38, borderRadius: 2, backgroundColor: colors.red },
  patientName: { color: colors.text, fontSize: 14, fontWeight: "700" },
  vitals: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  link: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  recentRow: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 15, flexDirection: "row", alignItems: "center" },
});
