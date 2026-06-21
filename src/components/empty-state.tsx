import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel grid min-h-72 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Icon className="h-6 w-6" /></div>
        <h2 className="mt-4 text-base font-bold text-slate-900">{title}</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}

