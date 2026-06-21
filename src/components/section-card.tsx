import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionCard({ title, description, icon: Icon, action, children, className, contentClassName }: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      <div className="flex min-h-16 items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        {Icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-[18px] w-[18px]" /></span>}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      <div className={cn("p-5 sm:p-6", contentClassName)}>{children}</div>
    </section>
  );
}

