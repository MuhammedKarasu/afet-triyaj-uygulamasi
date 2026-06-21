import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar user={user} />
      <div className="min-h-screen lg:pl-64">
        <Topbar user={user} />
        <main className="px-4 py-7 sm:px-7 lg:px-9 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
