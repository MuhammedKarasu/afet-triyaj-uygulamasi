import Link from "next/link";
import { SearchX } from "lucide-react";

export default function PatientNotFound() {
  return <div className="panel grid min-h-[60vh] place-items-center p-8 text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400"><SearchX className="h-7 w-7"/></div><h1 className="mt-4 text-xl font-black text-slate-900">Kayıt bulunamadı</h1><p className="mt-2 text-sm text-slate-500">Bu yaralı kaydı silinmiş veya bağlantı geçersiz olabilir.</p><Link href="/patients" className="btn-primary mt-5">Yaralı listesine dön</Link></div></div>;
}
