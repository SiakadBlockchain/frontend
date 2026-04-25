'use client';

import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Users, FileText, CheckCircle, GraduationCap, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuth } from '@/hooks/use-auth';

export default function UniversityDashboard() {
  const { universityId } = useAuth()
  const { loading, fetchUniversityData } = useDashboardData();
  
  const [data, setData] = useState({
    students: [],
    diplomas: []
  });

  useEffect(() => {
    if (universityId) {
      fetchUniversityData(universityId).then(res => {
        setData({
          students: res.universityStudents,
          diplomas: res.universityDiplomas
        });
      });
    }
  }, [universityId, fetchUniversityData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <p className="text-muted-foreground">Loading university dashboard...</p>
      </div>
    );
  }

  const enrolledCount = data.students.length;
  const verifiedDiplomas = data.diplomas.filter((d: any) => d.status === 'valid'); // Sesuai status di API Python anda

  const stats = [
    {
      label: 'Enrolled Students',
      value: enrolledCount,
      icon: Users,
      href: '/dashboard/university/students',
      description: 'Active students',
    },
    {
      label: 'Diplomas Issued',
      value: data.diplomas.length,
      icon: GraduationCap,
      href: '/dashboard/university/diplomas',
      description: 'Blockchain records',
    },
    {
      label: 'Verified Diplomas',
      value: verifiedDiplomas.length,
      icon: CheckCircle,
      href: '/dashboard/university/diplomas',
      description: 'On-chain validated',
    },
  ];

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">University Overview</h1>
          <p className="text-muted-foreground mt-2">
            Monitor academic statistics and blockchain credentials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <div className="border-card p-6 cursor-pointer table-row-hover">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                    <Icon size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}