'use client';

import { useRouter } from 'next/navigation';
import { useDashboardRole } from '@/hooks/use-dashboard-role';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useDashboardRole();
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading && role) {
      router.push(`/dashboard/${role}`);
    }
  }, [role, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border border-border border-t-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}
