'use client';

import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { GraduationCap, Users, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export default function AdminDashboard() {
  const { students, users, diplomas, universities, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // Stats
  const stats = [
    {
      label: 'Total Universities',
      value: universities.length,
      icon: GraduationCap,
      href: '/dashboard/admin/universities',
      description: 'Active institutions',
    },
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      href: '/dashboard/admin/students',
      description: 'Enrolled & graduated',
    },
    {
      label: 'Total Diplomas',
      value: diplomas.length,
      icon: FileText,
      href: '/dashboard/admin/diplomas',
      description: 'Issued & verified',
    },
    {
      label: 'Admin Users',
      value: users.length,
      icon: Settings,
      href: '/dashboard/admin/users',
      description: 'System administrators',
    },
  ];
  
  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage universities, students, users, and diplomas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <div className="border-card p-6 cursor-pointer table-row-hover">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </h3>
                    <Icon size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}