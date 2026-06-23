import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen, Card, Field, PageTitle, PrimaryButton, RiskBadge, SectionTitle, uiStyles } from "@/components/ui";
import { SegmentedControl } from "@/components/SegmentedControl";
import { calculateRisk } from "@/src/risk";
import { colors, RISK_META } from "@/src/theme";
import { useApp } from "@/src/store";
import { patientSchema, type PatientFormValues } from "@/src/validation";

const steps = [
  { title: "Kişisel Bilgiler", icon: "person-outline" as const, fields: ["fullName", "age", "gender", "identityNumber"] as const },
  { title: "Hayati Bulgular", icon: "pulse-outline" as const, fields: ["pulse", "spo2", "respiratoryStatus"] as const },
  { title: "Durum Bilgileri", icon: "medkit-outline" as const, fields: ["hasLifeSigns", "consciousness", "bleeding", "canWalk"] as const },
  { title: "Konum ve Notlar", icon: "location-outline" as const, fields: ["locationDescription", "latitude", "longitude", "notes"] as const },
];

export default function NewPatientScreen() {
  const { addPatient } = useApp();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const { control, handleSubmit, watch, trigger, reset, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { fullName: "", age: 35, gender: "MALE", identityNumber: "", pulse: 80, spo2: 98, respiratoryStatus: "NORMAL", consciousness: "ALERT", bleeding: "NONE", canWalk: true, hasLifeSigns: true, locationDescription: "", notes: "" },
  });
  const values = watch();
  const risk = useMemo(() => calculateRisk(values), [values]);

  async function next() {
    const valid = await trigger([...steps[step].fields]);
    if (valid) setStep((current) => Math.min(current + 1, 3));
  }

  async function save(data: PatientFormValues) {
    setSaving(true);
    try {
      const patient = await addPatient(data);
      reset(); setStep(0);
      router.push(`/patient/${patient.id}`);
    } catch {
      Alert.alert("Kayıt tamamlanamadı", "Lütfen alanları kontrol edip yeniden deneyin.");
    } finally { setSaving(false); }
  }

  return <AppScreen>
    <PageTitle eyebrow="HIZLI SAHA KAYDI" title="Yeni yaralı" description="Dört kısa adımda kaydı tamamlayın; risk anında hesaplansın."/>
    <View style={styles.progress}>{steps.map((item, index) => <View key={item.title} style={[styles.progressItem, index <= step && styles.progressActive]}><Text style={[styles.progressText, index <= step && styles.progressTextActive]}>{index + 1}</Text></View>)}</View>
    <Text style={styles.stepCaption}>{step + 1}/4 • {steps[step].title}</Text>

    <Card style={styles.formCard}>
      <SectionTitle icon={steps[step].icon} title={steps[step].title} caption={step === 0 ? "Bilinen kimlik bilgilerini girin" : step === 1 ? "Saha ölçümlerini kaydedin" : step === 2 ? "Gözlemsel durumu seçin" : "Ekibin ulaşabileceği bilgileri ekleyin"}/>
      {step === 0 && <View style={styles.fields}>
        <Controller control={control} name="fullName" render={({ field }) => <Field label="Ad Soyad *" value={field.value} onChangeText={field.onChange} placeholder="Örn. Ayşe Yılmaz" error={errors.fullName?.message}/>}/>
        <Controller control={control} name="age" render={({ field }) => <Field label="Yaş *" value={String(field.value)} onChangeText={(value) => field.onChange(Number(value))} keyboardType="number-pad" error={errors.age?.message}/>}/>
        <Controller control={control} name="gender" render={({ field }) => <SegmentedControl label="Cinsiyet" value={field.value} onChange={field.onChange} options={[{ label: "Kadın", value: "FEMALE" }, { label: "Erkek", value: "MALE" }, { label: "Diğer", value: "OTHER" }]}/>}/>
        <Controller control={control} name="identityNumber" render={({ field }) => <Field label="Kimlik bilgisi (opsiyonel)" value={field.value ?? ""} onChangeText={field.onChange} placeholder="T.C. kimlik veya geçici kod"/>}/>
      </View>}
      {step === 1 && <View style={styles.fields}>
        <View style={styles.twoColumns}>
          <View style={{ flex: 1 }}><Controller control={control} name="pulse" render={({ field }) => <Field label="Nabız /dk" value={String(field.value)} onChangeText={(value) => field.onChange(Number(value))} keyboardType="number-pad" error={errors.pulse?.message}/>}/></View>
          <View style={{ flex: 1 }}><Controller control={control} name="spo2" render={({ field }) => <Field label="SpO₂ %" value={String(field.value)} onChangeText={(value) => field.onChange(Number(value))} keyboardType="number-pad" error={errors.spo2?.message}/>}/></View>
        </View>
        <Controller control={control} name="respiratoryStatus" render={({ field }) => <SegmentedControl label="Solunum durumu" value={field.value} onChange={field.onChange} options={[{ label: "Normal", value: "NORMAL" }, { label: "Güçlük", value: "DIFFICULT" }, { label: "Yok", value: "NONE" }]}/>}/>
        <View style={styles.helper}><Text style={styles.helperText}>SpO₂ %90 altı veya nabız 130 üzeri kırmızı risk oluşturur.</Text></View>
      </View>}
      {step === 2 && <View style={styles.fields}>
        <Controller control={control} name="hasLifeSigns" render={({ field }) => <SegmentedControl label="Yaşam belirtisi" value={field.value} onChange={field.onChange} options={[{ label: "Var", value: true }, { label: "Yok", value: false }]}/>}/>
        <Controller control={control} name="consciousness" render={({ field }) => <SegmentedControl label="Bilinç durumu" value={field.value} onChange={field.onChange} options={[{ label: "Açık", value: "ALERT" }, { label: "Bulanık", value: "CONFUSED" }, { label: "Kapalı", value: "UNCONSCIOUS" }]}/>}/>
        <Controller control={control} name="bleeding" render={({ field }) => <SegmentedControl label="Kanama durumu" value={field.value} onChange={field.onChange} options={[{ label: "Yok", value: "NONE" }, { label: "Kontrollü", value: "MODERATE" }, { label: "Şiddetli", value: "SEVERE" }]}/>}/>
        <Controller control={control} name="canWalk" render={({ field }) => <SegmentedControl label="Hareket durumu" value={field.value} onChange={field.onChange} options={[{ label: "Yürüyebiliyor", value: true }, { label: "Yürüyemiyor", value: false }]}/>}/>
      </View>}
      {step === 3 && <View style={styles.fields}>
        <Controller control={control} name="locationDescription" render={({ field }) => <Field label="Konum açıklaması *" value={field.value} onChangeText={field.onChange} placeholder="Blok, kat, yakın nokta..." error={errors.locationDescription?.message}/>}/>
        <View style={styles.twoColumns}>
          <View style={{ flex: 1 }}><Controller control={control} name="latitude" render={({ field }) => <Field label="Enlem" value={field.value === undefined ? "" : String(field.value)} onChangeText={(value) => field.onChange(value ? Number(value.replace(",", ".")) : undefined)} keyboardType="decimal-pad" placeholder="38.4192"/>}/></View>
          <View style={{ flex: 1 }}><Controller control={control} name="longitude" render={({ field }) => <Field label="Boylam" value={field.value === undefined ? "" : String(field.value)} onChangeText={(value) => field.onChange(value ? Number(value.replace(",", ".")) : undefined)} keyboardType="decimal-pad" placeholder="27.1287"/>}/></View>
        </View>
        <Controller control={control} name="notes" render={({ field }) => <Field label="Saha notu" value={field.value ?? ""} onChangeText={field.onChange} multiline placeholder="Gözlem, yaralanma tipi, ilk yardım..." error={errors.notes?.message}/>}/>
        <View style={[styles.riskPreview, { backgroundColor: RISK_META[risk.level].background, borderColor: RISK_META[risk.level].color + "33" }]}><View style={uiStyles.wrap}><Text style={styles.riskLabel}>CANLI RİSK ANALİZİ</Text><RiskBadge level={risk.level}/></View><Text style={styles.riskReason}>{risk.reason}</Text></View>
      </View>}
    </Card>
    <View style={styles.actions}>{step > 0 && <View style={{ flex: 1 }}><PrimaryButton secondary title="Geri" icon="arrow-back" onPress={() => setStep((current) => current - 1)}/></View>}<View style={{ flex: 1.35 }}><PrimaryButton title={step === 3 ? "Analiz et ve kaydet" : "Devam et"} icon={step === 3 ? "checkmark" : "arrow-forward"} loading={saving} onPress={step === 3 ? handleSubmit(save) : next}/></View></View>
    <Text style={styles.disclaimer}>Sonuçlar eğitim ve karar destek amaçlıdır; tıbbi teşhis yerine geçmez.</Text>
  </AppScreen>;
}

const styles = StyleSheet.create({
  progress: { flexDirection: "row", gap: 8 },
  progressItem: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, alignItems: "center" },
  progressActive: { backgroundColor: colors.primary },
  progressText: { position: "absolute", top: 10, color: colors.textMuted, fontSize: 9, opacity: 0 },
  progressTextActive: { opacity: 0 },
  stepCaption: { color: colors.primaryDark, fontSize: 11, fontWeight: "700", marginTop: 2 },
  formCard: { gap: 0 },
  fields: { gap: 17 },
  twoColumns: { flexDirection: "row", gap: 10 },
  helper: { borderRadius: 13, padding: 12, backgroundColor: colors.blueSoft },
  helperText: { color: colors.blue, fontSize: 11, lineHeight: 17 },
  riskPreview: { borderWidth: 1, borderRadius: 16, padding: 15, gap: 9 },
  riskLabel: { color: colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: .8 },
  riskReason: { color: colors.text, fontSize: 13, lineHeight: 20, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10 },
  disclaimer: { color: colors.textMuted, fontSize: 10, lineHeight: 16, textAlign: "center", paddingHorizontal: 18 },
});
