'use client';

import { useState, useRef, useEffect } from 'react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { 
  ShieldCheck, 
  Smartphone, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { fetchStudentById, otpRequest, verifyOtpAndActivate } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function VerifyOtpPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [otpArray, setOtpArray] = useState(new Array(6).fill(""));
  const [isRequested, setIsRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpCode = otpArray.join("");

  useEffect(() => {
    const getStudentDetail = async () => {
      if (user?.id) {
        try {
          const res = await fetchStudentById(user.id);
          setStudentData(res.data);
        } catch (error) {
          console.error("Failed to fetch student profile:", error);
        }
      }
    };
    getStudentDetail();
  }, [user]);

  const isAlreadyVerified = studentData?.is_phone_verified === true;

  const handleRequestOtp = async () => {
    if (!user?.id || isAlreadyVerified) return;
    
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await otpRequest({ student_id: user.id });
      if (res.status === 'success' || res.status === 'info') {
        setIsRequested(true);
        setMessage({ type: res.status === 'success' ? 'success' : 'info', text: res.message });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to send OTP code.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || otpCode.length < 6 || isAlreadyVerified) return;

    setIsLoading(true);
    setMessage(null);
    try {
      const res = await verifyOtpAndActivate({ 
        student_id: user.id, 
        otp_code: otpCode 
      });
      
      if (res.status === 'success') {
        setMessage({ type: 'success', text: res.message });
        setTimeout(() => router.push('/dashboard/student'), 2000);
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Invalid or expired code.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Breadcrumbs />

      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6">
        <div className="w-full max-w-sm space-y-10">
          
          <div className="text-center space-y-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Security Verification</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Identity & Wallet Activation</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              Verify your identity to activate your blockchain-secured academic wallet.
            </p>
          </div>

          {(message || isAlreadyVerified) && (
            <div className={`p-4 rounded-md border flex gap-3 items-center justify-center animate-in fade-in slide-in-from-top-2 duration-300 ${
              (message?.type === 'success' || isAlreadyVerified) ? 'bg-green-50/50 border-green-200 text-green-800' : 
              message?.type === 'info' ? 'bg-blue-50/50 border-blue-200 text-blue-800' :
              'bg-red-50/50 border-red-200 text-red-800'
            }`}>
              {(message?.type === 'success' || isAlreadyVerified) ? 
                <CheckCircle2 size={16} className="shrink-0" /> : 
                <AlertCircle size={16} className="shrink-0" />
              }
              <p className="text-[11px] font-bold uppercase tracking-tight leading-normal text-center">
                {isAlreadyVerified ? "Identity verified. Wallet is active." : message?.text}
              </p>
            </div>
          )}

          <div className="bg-background border border-border rounded-md overflow-hidden">
            {!isAlreadyVerified && (
              <div className="p-8">
                {!isRequested ? (
                  <div className="space-y-6">
                    <p className="text-xs text-center text-muted-foreground">
                      An OTP code will be sent to your registered number via WhatsApp.
                    </p>
                    <button
                      onClick={handleRequestOtp}
                      disabled={isLoading}
                      className="w-full bg-primary text-white py-3 rounded-md font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Smartphone size={16} />}
                      Request OTP Code
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-8">
                    <div className="flex justify-between gap-2">
                      {otpArray.map((data, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          ref={(el) => { inputRefs.current[index] = el; }}
                          value={data}
                          onChange={(e) => handleChange(e.target.value, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-full h-12 bg-background border border-border rounded-md text-center text-lg font-mono font-bold focus:border-primary outline-none transition-all"
                        />
                      ))}
                    </div>

                    <div className="space-y-4">
                      <button
                        type="submit"
                        disabled={isLoading || otpCode.length < 6}
                        className="w-full bg-primary text-white py-3 rounded-md font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                        Verify & Activate
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={isLoading}
                        className="w-full text-[9px] text-muted-foreground hover:text-primary font-bold uppercase tracking-widest transition-colors block text-center"
                      >
                        Resend Code
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}