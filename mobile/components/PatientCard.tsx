import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RiskBadge, StatusBadge } from "./ui";
import { colors, radius, RISK_META, shadow } from "@/src/theme";
import type { Patient } from "@/src/types";

const formatDate = (value: string) => new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export function PatientCard({ patient, onPress }: { patient: Patient; onPress: () => void }) {
  const risk = RISK_META[patient.riskLevel];
  const initials = patient.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <Pressable accessibilityRole="button" accessibilityLabel={`${patient.fullName} detayını aç`} onPress={onPress} style={({ pressed }) => [styles.card, { borderLeftColor: risk.color }, pressed && { opacity: .82 }]}>
    <View style={styles.top}><View style={[styles.avatar, { backgroundColor: risk.background }]}><Text style={[styles.avatarText, { color: risk.color }]}>{initials}</Text></View><View style={{ flex: 1 }}><Text numberOfLines={1} style={styles.name}>{patient.fullName}</Text><View style={styles.badges}><RiskBadge level={patient.riskLevel}/><StatusBadge status={patient.interventionStatus}/></View></View><Ionicons name="chevron-forward" size={18} color="#A8B5B8"/></View>
    <View style={styles.meta}><View style={styles.metaItem}><Ionicons name="location-outline" size={15} color={colors.textMuted}/><Text numberOfLines={1} style={styles.metaText}>{patient.locationDescription}</Text></View><View style={styles.metaItem}><Ionicons name="time-outline" size={15} color={colors.textMuted}/><Text style={styles.metaText}>{formatDate(patient.createdAt)}</Text></View></View>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderLeftWidth: 4, borderColor: colors.border, padding: 15, gap: 13, ...shadow },
  top: { flexDirection: "row", alignItems: "center", gap: 11 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 13, fontWeight: "800" },
  name: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 7 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  meta: { gap: 7, paddingLeft: 55 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { flexShrink: 1, color: colors.textMuted, fontSize: 12 },
});
