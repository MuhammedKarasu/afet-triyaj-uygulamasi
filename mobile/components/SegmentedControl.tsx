import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/src/theme";

export type Segment<T extends string | boolean> = { label: string; value: T };

export function SegmentedControl<T extends string | boolean>({ label, options, value, onChange, scroll = false }: { label: string; options: Segment<T>[]; value: T; onChange: (value: T) => void; scroll?: boolean }) {
  const buttons = options.map((option) => {
    const active = option.value === value;
    return <Pressable key={String(option.value)} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onChange(option.value)} style={[styles.option, active && styles.optionActive]}><Text style={[styles.text, active && styles.textActive]}>{option.label}</Text></Pressable>;
  });
  return <View style={styles.wrap}><Text style={styles.label}>{label}</Text>{scroll ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>{buttons}</ScrollView> : <View style={styles.row}>{buttons}</View>}</View>;
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { color: colors.text, fontSize: 12, fontWeight: "700" },
  row: { flexDirection: "row", gap: 8 },
  option: { flex: 1, minHeight: 46, minWidth: 82, paddingHorizontal: 12, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: "#FBFDFD", alignItems: "center", justifyContent: "center" },
  optionActive: { borderColor: "#9FD9C9", backgroundColor: colors.primarySoft },
  text: { color: colors.textMuted, fontSize: 12, fontWeight: "600", textAlign: "center" },
  textActive: { color: colors.primaryDark, fontWeight: "700" },
});
