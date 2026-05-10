'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck, Smartphone, User, Mail, Lock, CreditCard, Phone, MapPin, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { verifyOtpAndActivate } from '@/lib/api'; 
import { motion, AnimatePresence } from 'framer-motion';

export function StudentRegistration() {
  const router = useRouter();
  const { registerStudent } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'register' | 'otp' | 'success'>('register');
  
  const [successData, setSuccessData] = useState<{privateKey: string, name: string, studentId: string} | null>(null);
  const [otpCode, setOtpCode] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    ktp_number: '',
    phone_number: '',
    birth_place: '',
    birth_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      ktp_number: formData.ktp_number,
      phone_number: formData.phone_number,
      place_and_date_of_birth: `${formData.birth_place}, ${formData.birth_date}`,
    };
    
    const result = await registerStudent(submitData);

    if (result.success) {
      setSuccessData({ 
        privateKey: result.privateKey, 
        name: formData.name,
        studentId: result.studentId 
      });
      setStep('otp');
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!successData?.studentId) return;

    setLoading(true);
    setError('');

    try {
      const result = await verifyOtpAndActivate({
        student_id: successData.studentId,
        otp_code: otpCode
      });

      if (result.status === "success") {
        setStep('success');
      } else {
        setError(result.message || 'OTP verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      
      <button
        onClick={() => router.back()}
        className="fixed top-8 left-8 p-2 text-muted-foreground hover:text-primary border border-border rounded-md hover:bg-muted/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">SiakadChain</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
            Student Wallet Registration
          </p>
        </div>

        <div className="border border-border rounded-md bg-background overflow-hidden">
          <div className="p-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 border border-destructive/20 bg-destructive/5 rounded-md flex gap-3 items-center"
                >
                  <AlertCircle size={16} className="text-destructive" />
                  <p className="text-[11px] font-medium text-destructive leading-tight">{error}</p>
                </motion.div>
              )}

              {step === 'register' && (
                <motion.div key="register-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                      <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="pl-10 h-11 text-sm border-border" />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                      <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="pl-10 h-11 text-sm border-border" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input name="ktp_number" placeholder="National ID (NIK)" value={formData.ktp_number} onChange={handleChange} required className="pl-10 h-11 text-sm border-border" />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input name="phone_number" placeholder="WhatsApp Number" value={formData.phone_number} onChange={handleChange} required className="pl-10 h-11 text-sm border-border" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input name="birth_place" placeholder="Birth Place" value={formData.birth_place} onChange={handleChange} required className="pl-10 h-11 text-sm border-border" />
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} required className="pl-10 h-11 text-sm border-border" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="pl-10 h-11 text-sm border-border" />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input name="confirmPassword" type="password" placeholder="Confirm" value={formData.confirmPassword} onChange={handleChange} required className="pl-10 h-11 text-sm border-border" />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSubmit} disabled={loading} className="w-full h-11 text-[10px] font-bold uppercase tracking-widest transition-all">
                    {loading ? 'Processing...' : 'Register Student Wallet'}
                  </Button>
                </motion.div>
              )}

              {step === 'otp' && (
                <motion.div key="otp-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-lg font-bold tracking-tight">Phone Verification</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Enter the 6-digit OTP code sent to <br/><span className="font-bold text-foreground">{formData.phone_number}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <Input 
                      placeholder="000000" 
                      value={otpCode} 
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="h-14 text-center text-2xl tracking-[0.5em] font-mono font-bold border-border focus:ring-0 focus:border-primary"
                      maxLength={6}
                      required 
                    />
                    <Button type="submit" disabled={loading} className="w-full h-11 text-[10px] font-bold uppercase tracking-widest">
                      {loading ? 'Verifying...' : 'Verify & Activate Wallet'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/auth')} 
                      className="w-full h-11 border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted"
                    >
                      Verify Later
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div key="success-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-green-50 text-green-600 mb-2 border border-green-100">
                      <CheckCircle2 size={28} />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">Account Activated</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Verification successful. Your blockchain identity has been established and your wallet is ready.
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 border border-border rounded-md">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest text-center leading-relaxed">
                      Your credentials can now be securely verified on the Avalanche network.
                    </p>
                  </div>

                  <Button onClick={() => router.push('/auth')} className="w-full h-11 text-[10px] font-bold uppercase tracking-widest">
                    Back to Sign In
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Secured by Avalanche Ecosystem
        </p>
      </div>
    </div>
  );
}