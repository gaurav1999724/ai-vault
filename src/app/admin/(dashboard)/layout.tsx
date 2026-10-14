import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { BrandLoader } from "@/components/states/loading-skeleton";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<BrandLoader />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-panel md:grid md:grid-cols-[240px_1fr]">
      <AdminSidebar />
      <div className="min-w-0 pt-16 md:pt-0">{children}</div>
    </div>
  );
}
