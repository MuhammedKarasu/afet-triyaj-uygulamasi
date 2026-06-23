import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppScreen, Card, PageTitle, uiStyles } from "@/components/ui";
import { colors } from "@/src/theme";
import { useApp } from "@/src/store";

export default function TeamsScreen() {
  const { teams } = useApp();
  return <AppScreen><PageTitle eyebrow="KOORDİNASYON" title="Saha ekipleri" description="Aktif ekipleri, görev bölgelerini ve iş yükünü izleyin."/>{teams.map((team) => <Card key={team.id} style={{ gap: 14 }}><View style={styles.top}><View style={[styles.icon, !team.isActive && { backgroundColor: colors.slateSoft }]}><Ionicons name="people" size={22} color={team.isActive ? colors.primary : colors.slate}/></View><View style={{ flex: 1 }}><Text style={styles.name}>{team.name}</Text><View style={styles.status}><View style={[styles.dot, { backgroundColor: team.isActive ? colors.green : colors.slate }]}/><Text style={styles.statusText}>{team.isActive ? "Aktif saha ekibi" : "Pasif"}</Text></View></View><View style={styles.count}><Text style={styles.countValue}>{team.assignedCount}</Text><Text style={styles.countLabel}>atama</Text></View></View><View style={uiStyles.divider}/><View style={styles.info}><Ionicons name="location-outline" size={17} color={colors.textMuted}/><Text style={styles.infoText}>{team.region}</Text></View><View style={styles.info}><Ionicons name="person-outline" size={17} color={colors.textMuted}/><Text style={styles.infoText}>{team.members.join(" • ")}</Text></View></Card>)}</AppScreen>;
}

const styles = StyleSheet.create({ top: { flexDirection: "row", alignItems: "center", gap: 11 }, icon: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }, name: { color: colors.text, fontSize: 16, fontWeight: "700" }, status: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 }, dot: { width: 6, height: 6, borderRadius: 3 }, statusText: { color: colors.textMuted, fontSize: 11 }, count: { alignItems: "center", minWidth: 46 }, countValue: { color: colors.text, fontSize: 20, fontWeight: "800" }, countLabel: { color: colors.textMuted, fontSize: 9 }, info: { flexDirection: "row", alignItems: "flex-start", gap: 9 }, infoText: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 18 } });
