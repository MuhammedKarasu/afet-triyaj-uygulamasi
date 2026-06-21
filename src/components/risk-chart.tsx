"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = { Kırmızı: "#dc2626", Sarı: "#f59e0b", Yeşil: "#10b981", "Siyah / Gri": "#64748b" };

export function RiskChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="relative h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={230} initialDimension={{ width: 320, height: 230 }}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={68} outerRadius={92} paddingAngle={3} strokeWidth={0}>
            {data.map((item) => <Cell key={item.name} fill={COLORS[item.name]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 8px 20px rgba(15,23,42,.08)" }} formatter={(value) => [`${value} kişi`, "Kayıt"]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-3xl font-black text-slate-900">{total}</p><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Toplam</p></div></div>
    </div>
  );
}
