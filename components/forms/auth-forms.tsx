'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types';
import { AlertCircle, Wallet, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface AuthFormsProps {
  initialTab?: 'login' | 'register';
}

export function AuthForms({ initialTab = 'login' }: AuthFormsProps) {
  const router = useRouter();

  const {
    login,
    register: registerUser,
    connectWallet,
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

  const [connectWalletAfterRegister, setConnectWalletAfterRegister] = useState(false);

  const [universities, setUniversities] = useState<any[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoadingUniversities(true);
      const result = await getUniversities();
      if (result.success) {
        setUniversities(result.data);
      } else {
        console.error(result.error);
      }
      setLoadingUniversities(false);
    };
    fetchUniversities();
  }, [getUniversities]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login failed');
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
      if (connectWalletAfterRegister) {
        await connectWallet();
      }
      router.push('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  const handleConnectWallet = async () => {
    setError('');
    setLoading(true);
    const result = await connectWallet();
    if (!result.success) {
      setError(result.error || 'Failed to connect wallet');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- DRAGGABLE HOME MENU --- */}
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Membatasi agar kembali ke posisi awal jika dilepas, atau hapus baris ini agar bebas
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9, cursor: 'grabbing' }}
        className="fixed bottom-10 right-10 z-50 cursor-grab"
      >
        <Button
          onClick={() => router.push('/')}
          className="cursor-pointer h-12 w-12 rounded-full shadow-2xl flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground"
          title="Kembali ke Halaman Utama"
        >
          <Home size={28} />
        </Button>
      </motion.div>
      {/* --------------------------- */}

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            SiakadChain
          </h1>
          <p className="text-muted-foreground">
            Blockchain Academic Credential System
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-center font-medium border-b-2 ${
              activeTab === 'login'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-center font-medium border-b-2 ${
              activeTab === 'register'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-md border border-destructive/50 bg-destructive/10 flex gap-3">
            <AlertCircle size={18} className="text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Button
              type="button"
              onClick={handleConnectWallet}
              variant="outline"
              className="w-full"
            >
              <Wallet size={18} className="mr-2" />
              Connect MetaMask
            </Button>
          </form>
        )}

        {/* REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
            <select
              value={registerRole}
              onChange={(e) => setRegisterRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="university">University Administrator</option>
              <option value="admin">System Administrator</option>
              <option value="validator">Blockchain Validator</option>
            </select>
            {registerRole === 'university' && (
              <select
                value={registerUniversityId}
                onChange={(e) => setRegisterUniversityId(e.target.value)}
                className="w-full px-4 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="">
                  {loadingUniversities ? 'Loading universities...' : 'Select University'}
                </option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            )}
            <Input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}