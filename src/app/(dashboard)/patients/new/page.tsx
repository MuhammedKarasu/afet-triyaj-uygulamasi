import Link from "next/link";
import { ArrowLeft, ClipboardPlus, Info } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PatientForm } from "@/components/patient-form";
import { requireUser } from "@/lib/auth";

export default async function NewPatientPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader eyebrow="Yeni saha kaydı" title="Yaralı triyaj formu" description="Hayati bulguları eksiksiz girin; sistem müdahale önceliğini otomatik olarak hesaplasın." icon={ClipboardPlus}
        actions={<Link className="btn-secondary" href="/patients"><ArrowLeft className="h-4 w-4"/>Listeye dön</Link>} />
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3.5 text-xs leading-5 text-blue-800"><Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"/><p><b>Önemli:</b> Bu uygulama tıbbi teşhis sistemi değildir. Triyaj sonucu eğitim ve karar destek amacıyla üretilir; nihai değerlendirme yetkili sağlık personeline aittir.</p></div>
      <PatientForm recorderName={user.name} />
    </>
  );
}
