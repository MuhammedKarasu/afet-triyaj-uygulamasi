import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppScreen, PageTitle } from "@/components/ui";
import { PatientCard } from "@/components/PatientCard";
import { SegmentedControl } from "@/components/SegmentedControl";
import { colors, RISK_META } from "@/src/theme";
import { useApp } from "@/src/store";
import type { RiskLevel } from "@/src/types";

type Filter = "ALL" | RiskLevel;

export default function PatientsScreen() {
  const { patients } = useApp();
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<Filter>("ALL");
  const visible = useMemo(() => patients.filter((patient) => (risk === "ALL" || patient.riskLevel === risk) && `${patient.fullName} ${patient.locationDescription}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))).sort((a, b) => RISK_META[a.riskLevel].order - RISK_META[b.riskLevel].order || b.createdAt.localeCompare(a.createdAt)), [patients, query, risk]);
  return <AppScreen>
    <PageTitle eyebrow="SAHA KAYITLARI" title="Yaralılar" description={`${visible.length} kayıt müdahale önceliğine göre sıralanıyor.`}/>
    <TextInput accessibilityLabel="Yaralı ara" value={query} onChangeText={setQuery} placeholder="Ad veya konum ara" placeholderTextColor="#96A6A9" style={styles.search}/>
    <SegmentedControl label="Risk filtresi" scroll value={risk} onChange={setRisk} options={[{ label: "Tümü", value: "ALL" }, { label: "Kırmızı", value: "RED" }, { label: "Sarı", value: "YELLOW" }, { label: "Yeşil", value: "GREEN" }, { label: "Siyah/Gri", value: "BLACK" }]}/>
    <View style={styles.list}>{visible.map((patient) => <PatientCard key={patient.id} patient={patient} onPress={() => router.push(`/patient/${patient.id}`)}/>)}</View>
    {!visible.length && <View style={styles.empty}><Text style={styles.emptyTitle}>Kayıt bulunamadı</Text><Text style={styles.emptyText}>Arama veya risk filtresini değiştirin.</Text></View>}
  </AppScreen>;
}

const styles = StyleSheet.create({ search: { minHeight: 52, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, color: colors.text, fontSize: 15 }, list: { gap: 12 }, empty: { minHeight: 180, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: colors.border }, emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "700" }, emptyText: { color: colors.textMuted, fontSize: 12, marginTop: 5 } });
