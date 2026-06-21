import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { RISK, STATUS } from "@/lib/constants";

export function SearchFilterBar({ query, risk, status }: { query: string; risk: string; status: string }) {
  return (
    <form className="panel mb-5 grid gap-3 p-3 sm:p-4 md:grid-cols-[1fr_180px_210px_auto]" method="get">
      <div className="relative"><Search className="absolute left-3.5 top-4 h-4 w-4 text-slate-400"/><input name="q" defaultValue={query} className="input pl-10" placeholder="Ad, kimlik veya konum ara" aria-label="Yaralı ara"/></div>
      <div className="relative"><Filter className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-slate-400"/><select name="risk" defaultValue={risk} className="input pl-10" aria-label="Risk seviyesi"><option value="ALL">Tüm riskler</option>{Object.entries(RISK).map(([value,item])=><option value={value} key={value}>{item.label}</option>)}</select></div>
      <div className="relative"><SlidersHorizontal className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-slate-400"/><select name="status" defaultValue={status} className="input pl-10" aria-label="Müdahale durumu"><option value="ALL">Tüm müdahale durumları</option>{Object.entries(STATUS).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></div>
      <button className="btn-secondary md:px-5" type="submit">Uygula</button>
    </form>
  );
}

