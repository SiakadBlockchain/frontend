'use client';

import { useState, useCallback, useEffect } from 'react';
import { User, UserRole, AuthState } from '@/types';

const STORAGE_KEY = 'siakadchain_auth';
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API;

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null,
    walletConnected: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);

        setAuthState({
          isAuthenticated: true,
          user: parsed.user,
          role: parsed.user.role,
          walletConnected: !!parsed.user.walletAddress,
        });
      } catch (error) {
        console.error('Failed to parse auth state:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await fetch(`${API_URL}/siakadBlockchain/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        console.log(data);

        if (!res.ok) {
          return {
            success: false,
            error: data.detail?.message || 'Login failed',
          };
        }

        const user = data.data.user;
        const token = data.data.access_token;

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user, token })
        );

        setAuthState({
          isAuthenticated: true,
          user,
          role: user.role,
          walletConnected: false,
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: 'Network error' };
      }
    },
    []
  );

  const register = useCallback(
    async (email: string, name: string, role: UserRole, password: string, university_id?: string) => {
      try {
        const res = await fetch(`${API_URL}/siakadBlockchain/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, role, password, university_id }),
        });

        const data = await res.json();

        if (!res.ok) {
          return {
            success: false,
            error: data.detail?.message || 'Register failed',
          };
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: 'Network error' };
      }
    },
    []
  );

  const getUniversities = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/siakadBlockchain/api/universities`, {
        method: 'GET',
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data?.detail?.message || 'Failed to fetch universities',
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
      };
    }
  }, []);

  const connectWallet = useCallback(async (): Promise<{
    success: boolean;
    address?: string;
    error?: string;
  }> => {
    try {
      const mockAddress = `0x${Math.random().toString(16).slice(2).padEnd(40, '0')}`;

      setAuthState((prev) => {
        const updatedState = {
          ...prev,
          walletConnected: true,
          user: prev.user
            ? { ...prev.user, walletAddress: mockAddress }
            : null,
        };

        if (updatedState.user) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              user: updatedState.user,
              role: updatedState.role,
            })
          );
        }

        return updatedState;
      });

      return { success: true, address: mockAddress };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect wallet. Make sure MetaMask is installed.',
      };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: null,
      walletConnected: false,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const universityId =
  authState.role === 'university'
    ? authState.user?.university_id ?? null
    : null;

  return {
    ...authState,
    loading,
    login,
    register,
    connectWallet,
    logout,
    getUniversities,
    universityId,
  };
}
