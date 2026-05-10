'use client';

import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { 
  User, 
  Wallet as WalletIcon,
  Mail,
  Phone,
  IdCard,
  MapPin,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { fetchStudentById } from '@/lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStudentDetail = async () => {
      if (user?.id) {
        try {
          const res = await fetchStudentById(user.id);
          setStudentData(res.data);
        } catch (error) {
          console.error("Failed to fetch student profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    getStudentDetail();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <p className="text-muted-foreground italic">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs />

      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Student Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {studentData?.name}. Here are your profile details and blockchain status.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="border-card p-6">
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <User size={20} className="text-primary" /> Personal Information
                </h2>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  studentData?.is_phone_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {studentData?.is_phone_verified ? 'VERIFIED' : 'UNVERIFIED'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <InfoItem label="Full Name" value={studentData?.name} icon={<User size={16}/>} />
                <InfoItem label="Email" value={studentData?.email} icon={<Mail size={16}/>} />
                <InfoItem label="ID Number" value={studentData?.ktp_number} icon={<IdCard size={16}/>} />
                <InfoItem label="Phone Number" value={studentData?.phone_number} icon={<Phone size={16}/>} />
                <InfoItem label="Place, Date of Birth" value={studentData?.place_and_date_of_birth} icon={<MapPin size={16}/>} />
                <InfoItem label="Registration Date" value={new Date(studentData?.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })} icon={<Calendar size={16}/>} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-card p-6 bg-primary/[0.02] border-primary/20">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                <WalletIcon size={20} className="text-primary" /> Blockchain Wallet
              </h2>

              {studentData?.wallet ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 text-primary">Wallet Address (AVAX)</p>
                    <div className="bg-background border border-border p-3 rounded-md break-all font-mono text-[11px] relative group">
                      {studentData.wallet.blockchain_address}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4 border-dashed">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-xs font-bold">Connected</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Created At</p>
                      <p className="text-xs font-medium mt-1">
                        {new Date(studentData.wallet.created_at).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <WalletIcon size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Wallet Not Active</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    Complete OTP verification to activate your automatic wallet.
                  </p>
                  <Link href="/dashboard/student/verify-otp">
                    <button className="text-xs bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-all font-semibold">
                      Activate Now
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function InfoItem({ label, value, icon, isMono = false }: { label: string, value: string, icon: React.ReactNode, isMono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-sm font-medium ${isMono ? 'font-mono bg-muted/50 px-2 py-1 rounded text-xs' : 'text-foreground'}`}>
        {value || '-'}
      </p>
    </div>
  );
}