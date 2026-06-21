import type { LucideIcon } from "lucide-react";
import { SectionCard } from "@/components/section-card";

export function FormSection({ step, title, description, icon, children, className }: {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SectionCard
      title={title}
      description={description}
      icon={icon}
      className={className}
      action={<span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">{step}/4</span>}
    >
      {children}
    </SectionCard>
  );
}

