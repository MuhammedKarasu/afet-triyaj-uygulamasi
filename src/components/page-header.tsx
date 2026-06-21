import type { LucideIcon } from "lucide-react";

export function PageHeader({ eyebrow, title, description, icon: Icon, actions }: {
  eyebrow?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3.5">
        {Icon && <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></div>}
        <div>
          {eyebrow && <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-brand-600">{eyebrow}</p>}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

