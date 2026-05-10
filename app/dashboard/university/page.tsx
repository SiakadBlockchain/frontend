'use client';

import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Users, CheckCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { fetchStudiesByUniversity, fetchDiplomasByUniversity } from '@/lib/api'; // Pastikan path ke api.ts benar

export default function UniversityDashboard() {
  const { universityId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    enrolledStudents: 0,
    issuedDiplomas: 0,
    verifiedDiplomas: 0
  });

  useEffect(() => {
    async function loadDashboardData() {
      if (!universityId) return;
      
      setLoading(true);
      try {
        const [studiesRes, diplomasRes] = await Promise.all([
          fetchStudiesByUniversity(universityId),
          fetchDiplomasByUniversity(universityId)
        ]);

        // Logging untuk mempermudah debugging di console browser
        console.log("Studies Response:", studiesRes);
        console.log("Diplomas Response:", diplomasRes);

        // Menangani berbagai kemungkinan struktur respons API
        const studiesList = studiesRes.data || studiesRes.results || (Array.isArray(studiesRes) ? studiesRes : []);
        const diplomasList = diplomasRes.data || diplomasRes.results || (Array.isArray(diplomasRes) ? diplomasRes : []);

        setData({
          enrolledStudents: studiesRes.total || studiesList.length || 0,
          issuedDiplomas: diplomasRes.total || diplomasList.length || 0,
          verifiedDiplomas: diplomasList.filter((d: any) => d.status === 'valid').length
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [universityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <p className="text-muted-foreground">Loading university dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Student Studies',
      value: data.enrolledStudents,
      icon: Users,
      href: '/dashboard/university/studies',
      description: 'Active academic records',
    },
    {
      label: 'Issued Diplomas',
      value: data.issuedDiplomas,
      icon: GraduationCap,
      href: '/dashboard/university/diplomas',
      description: 'Total blockchain records',
    },
    {
      label: 'Verified Diplomas',
      value: data.verifiedDiplomas,
      icon: CheckCircle,
      href: '/dashboard/university/diplomas',
      description: 'On-chain validated (Valid)',
    },
  ];

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6">
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