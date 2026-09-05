"use client";

import { AppShell } from "@/components/app-shell";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading,} = useAuth()
  const router = useRouter();

  useRoleGuard(user?.role);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
      </div>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}
