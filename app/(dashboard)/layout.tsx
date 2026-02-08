"use client";

import { AppShell } from "@/components/app-shell";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, organization, loading, logout } = useAuth()
  const router = useRouter();

  useRoleGuard(user?.role);

  if (loading) return null;

  if (!user) {
    router.push("/");
    return null;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
