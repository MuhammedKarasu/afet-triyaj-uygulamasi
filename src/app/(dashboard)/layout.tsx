import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";
import { RouteScrollReset } from "@/components/route-scroll-reset";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-dvh bg-canvas">
      <RouteScrollReset />
      <Sidebar user={user} />
      <div className="min-h-dvh lg:pl-64">
        <Topbar user={user} />
        <main className="px-4 pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-7 sm:px-7 lg:px-9 lg:pb-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
