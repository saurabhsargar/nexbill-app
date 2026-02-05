"use client";

import { AppShell } from '@/components/app-shell';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    router.push('/');
    return null;
  }
  return <AppShell>{children}</AppShell>;
}
