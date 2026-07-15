'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types';
import { AlertCircle, Wallet, Home, Download, ShieldCheck, Key, Mail, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormsProps {
  initialTab?: 'login' | 'register';
}

export function AuthForms({ initialTab = 'login' }: AuthFormsProps) {
  const router = useRouter();

  const {
    login,
    register: registerUser,
    getUniversities,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('university');
  const [registerUniversityId, setRegisterUniversityId] = useState('');

  const [registeredData, setRegisteredData] = useState<{
    privateKey: string;
    fullName: string;
  } | null>(null);

  const [universities, setUniversities] = useState<any[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoadingUniversities(true);
      const result = await getUniversities();
      if (result.success) {
        setUniversities(result.data);
      }
      setLoadingUniversities(false);
    };
    fetchUniversities();
  }, [getUniversities]);

  const handleDownloadPrivateKey = () => {
    if (!registeredData) return;
    const element = document.createElement("a");
    const file = new Blob([registeredData.privateKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${registeredData.fullName.replace(/\s+/g, '_')}_private_key.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (registerPassword !== registerConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (registerRole === 'university' && !registerUniversityId) {
      setError('Please select a university');
      return;
    }
    setLoading(true);
    const result = await registerUser(
      registerEmail,
      registerName,
      registerRole,
      registerPassword,
      registerUniversityId
    );

    if (result.success) {
      setRegisteredData({
        privateKey: result.private_key || '',
        fullName: registerName
      });
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      
      {/* Home Button - Minimalist Fixed Position */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-8 left-8 p-2 text-muted-foreground hover:text-primary border border-border rounded-md hover:bg-muted/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
      >
        <Home size={16} /> Back to Home
      </button>

      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AcademicChain</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
            Blockchain Academic Credential System
          </p>
        </div>

        <div className="border border-border rounded-md bg-background overflow-hidden">
          {!registeredData && (
            <div className="flex border-b border-border bg-muted/10">
              <button
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'login' ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/20'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === 'register' ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/20'
                }`}
              >
                Register
              </button>
            </div>
          )}

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

              {registeredData ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-2">
                      <ShieldCheck size={28} />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">Registration Successful</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {registeredData.privateKey 
                        ? 'Your account has been created. Please download your Private Key for future credential signing.'
                        : 'Your account has been successfully created. You can now proceed to the dashboard.'}
                    </p>
                  </div>

                  {registeredData.privateKey && (
                    <div className="p-4 bg-muted/30 border border-border rounded-md">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center leading-relaxed">
                        WARNING: Keep this file secure. It cannot be recovered and is required for blockchain operations.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {registeredData.privateKey && (
                      <Button 
                        onClick={handleDownloadPrivateKey} 
                        className="w-full h-11 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90"
                      >
                        <Download size={16} className="mr-2" /> Download Private Key
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full h-11 border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted"
                      onClick={() => router.push('/dashboard')}
                    >
                      Continue to Dashboard
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {activeTab === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-4">
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                          <Input
                            type="email"
                            placeholder="Email Address"
                            className="pl-10 h-11 text-sm border-border focus:ring-0 focus:border-primary"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                          <Input
                            type="password"
                            placeholder="Password"
                            className="pl-10 h-11 text-sm border-border focus:ring-0 focus:border-primary"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full h-11 text-[10px] font-bold uppercase tracking-widest transition-all">
                        {loading ? 'Authenticating...' : 'Sign In'}
                      </Button>
                      
                      <div className="relative py-4 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                        <span className="relative bg-background px-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Student Portal</span>
                      </div>

                      <Button
                        type="button"
                        onClick={() => router.push('/register/student')}
                        variant="outline"
                        className="w-full h-11 border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted"
                      >
                        <Wallet size={16} className="mr-2" /> Connect Student Wallet
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-3">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                          <Input
                            placeholder="Full Name"
                            className="pl-10 h-10 text-sm border-border"
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                          <Input
                            type="email"
                            placeholder="Email"
                            className="pl-10 h-10 text-sm border-border"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <select
                            value={registerRole}
                            onChange={(e) => setRegisterRole(e.target.value as UserRole)}
                            className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm outline-none focus:border-primary transition-all appearance-none"
                          >
                            <option value="university">University Administrator</option>
                            <option value="admin">System Administrator</option>
                            <option value="validator">Blockchain Validator</option>
                          </select>
                          
                          {registerRole === 'university' && (
                            <select
                              value={registerUniversityId}
                              onChange={(e) => setRegisterUniversityId(e.target.value)}
                              className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm outline-none focus:border-primary transition-all"
                            >
                              <option value="">{loadingUniversities ? 'Loading...' : 'Select University Entity'}</option>
                              {universities.map((uni) => (
                                <option key={uni.id} value={uni.id}>{uni.name}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="password"
                            placeholder="Password"
                            className="h-10 text-sm border-border"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                          />
                          <Input
                            type="password"
                            placeholder="Confirm"
                            className="h-10 text-sm border-border"
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={loading} className="w-full h-11 text-[10px] font-bold uppercase tracking-widest mt-2">
                        {loading ? 'Processing...' : 'Create Account'}
                      </Button>
                    </form>
                  )}
                </div>
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