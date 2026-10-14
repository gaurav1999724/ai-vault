import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentAdmin } from "@/lib/auth";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <Suspense>
      <LoginGate searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginGate({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");
  const next = (await searchParams).next || "/admin";
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-panel p-8">
        <p className="text-xs tracking-[0.2em] text-cyan">ADMINISTRATOR</p>
        <h1 className="mt-3 font-display text-5xl">Enter the vault</h1>
        <p className="mt-3 text-sm text-muted">There is no public registration. The first account is created with the provisioning command.</p>
        <LoginForm nextPath={next.startsWith("/admin") ? next : "/admin"} />
      </div>
    </main>
  );
}
