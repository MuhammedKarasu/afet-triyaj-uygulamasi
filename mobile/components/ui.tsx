import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, RISK_META, shadow, STATUS_META } from "@/src/theme";
import type { InterventionStatus, RiskLevel } from "@/src/types";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function AppScreen({ children, scroll = true, contentStyle }: { children: ReactNode; scroll?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  const content = scroll ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.screenContent, contentStyle]}>{children}</ScrollView> : <View style={[styles.screenContent, { flex: 1 }, contentStyle]}>{children}</View>;
  return <SafeAreaView edges={["top"]} style={styles.safe}>{content}</SafeAreaView>;
}

export function BrandMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return <View style={styles.brandRow}>
    <View style={[styles.brandIcon, inverse && styles.brandIconInverse]}><Ionicons name="pulse" size={compact ? 20 : 25} color={inverse ? colors.primary : colors.white}/></View>
    <View><Text style={[styles.brandName, inverse && { color: colors.white }, compact && { fontSize: 18 }]}>AfetSaha</Text>{!compact && <Text style={[styles.brandTagline, inverse && { color: "rgba(255,255,255,.65)" }]}>ACİL DURUM VE SAHA YÖNETİMİ</Text>}</View>
  </View>;
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <View style={styles.titleRow}><View style={{ flex: 1 }}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}<Text style={styles.title}>{title}</Text>{description && <Text style={styles.description}>{description}</Text>}</View>{action}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ icon, title, caption }: { icon: IconName; title: string; caption?: string }) {
  return <View style={styles.sectionTitle}><View style={styles.sectionIcon}><Ionicons name={icon} size={18} color={colors.primary}/></View><View style={{ flex: 1 }}><Text style={styles.sectionTitleText}>{title}</Text>{caption && <Text style={styles.sectionCaption}>{caption}</Text>}</View></View>;
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const meta = RISK_META[level];
  return <View style={[styles.badge, { backgroundColor: meta.background }]}><View style={[styles.dot, { backgroundColor: meta.color }]}/><Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text></View>;
}

export function StatusBadge({ status }: { status: InterventionStatus }) {
  const meta = STATUS_META[status];
  return <View style={[styles.badge, { backgroundColor: meta.background }]}><View style={[styles.dot, { backgroundColor: meta.color }]}/><Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text></View>;
}

export function MetricCard({ label, value, icon, tone }: { label: string; value: number; icon: IconName; tone: "primary" | "red" | "amber" | "green" | "blue" | "slate" }) {
  const tones = { primary: [colors.primary, colors.primarySoft], red: [colors.red, colors.redSoft], amber: [colors.amber, colors.amberSoft], green: [colors.green, colors.greenSoft], blue: [colors.blue, colors.blueSoft], slate: [colors.slate, colors.slateSoft] } as const;
  const [color, background] = tones[tone];
  return <Card style={styles.metric}><View style={[styles.metricIcon, { backgroundColor: background }]}><Ionicons name={icon} size={19} color={color}/></View><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></Card>;
}

export function PrimaryButton({ title, onPress, icon = "arrow-forward", disabled = false, loading = false, secondary = false }: { title: string; onPress: () => void; icon?: IconName; disabled?: boolean; loading?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, (disabled || loading) && { opacity: .55 }, pressed && { transform: [{ scale: .99 }] }]}>
    {loading ? <ActivityIndicator color={secondary ? colors.primary : colors.white}/> : <><Text style={[styles.buttonText, secondary && { color: colors.primary }]}>{title}</Text><Ionicons name={icon} size={18} color={secondary ? colors.primary : colors.white}/></>}
  </Pressable>;
}

export function Field({ label, value, onChangeText, placeholder, error, keyboardType = "default", multiline = false, secureTextEntry = false, autoCapitalize = "sentences" }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; error?: string; keyboardType?: KeyboardTypeOptions; multiline?: boolean; secureTextEntry?: boolean; autoCapitalize?: "none" | "sentences" | "words" | "characters" }) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#96A6A9" keyboardType={keyboardType} multiline={multiline} secureTextEntry={secureTextEntry} autoCapitalize={autoCapitalize} style={[styles.input, multiline && styles.textarea, Boolean(error) && styles.inputError]}/>{Boolean(error) && <Text style={styles.error}>{error}</Text>}</View>;
}

export function InfoRow({ label, value, icon }: { label: string; value: string; icon?: IconName }) {
  return <View style={styles.infoRow}>{icon && <Ionicons name={icon} size={18} color={colors.textMuted}/>}<View style={{ flex: 1 }}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View></View>;
}

export const uiStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  wrap: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  heading: { color: colors.text, fontSize: 17, fontWeight: "700" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  screenContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 122, gap: 16 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  brandIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  brandIconInverse: { backgroundColor: colors.white },
  brandName: { color: colors.text, fontSize: 22, fontWeight: "800", letterSpacing: -.5 },
  brandTagline: { marginTop: 2, color: colors.textMuted, fontSize: 8, fontWeight: "700", letterSpacing: 1.05 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 2 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.25, marginBottom: 5 },
  title: { color: colors.text, fontSize: 29, lineHeight: 34, fontWeight: "800", letterSpacing: -.8 },
  description: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 16, ...shadow },
  sectionTitle: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 15 },
  sectionIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  sectionTitleText: { color: colors.text, fontSize: 16, fontWeight: "700" },
  sectionCaption: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  badge: { minHeight: 27, borderRadius: radius.pill, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 10, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  metric: { width: "48%", minHeight: 128, justifyContent: "space-between" },
  metricIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  metricValue: { color: colors.text, fontSize: 30, fontWeight: "800", letterSpacing: -1 },
  metricLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  button: { minHeight: 52, borderRadius: 16, backgroundColor: colors.primary, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  buttonSecondary: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: "#C7EADF" },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  fieldWrap: { gap: 7 },
  fieldLabel: { color: colors.text, fontSize: 12, fontWeight: "700" },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FBFDFD", borderRadius: 15, paddingHorizontal: 15, color: colors.text, fontSize: 15 },
  textarea: { minHeight: 104, paddingTop: 14, textAlignVertical: "top" },
  inputError: { borderColor: colors.red },
  error: { color: colors.red, fontSize: 11, fontWeight: "600" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10 },
  infoLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "700", letterSpacing: .4, textTransform: "uppercase" },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: "600", lineHeight: 20, marginTop: 3 },
});
