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
          user: user,
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

        return { 
          success: true, 
          private_key: data.private_key 
        };
        
      } catch (error) {
        return { success: false, error: 'Network error' };
      }
    },
    []
  );

  const registerStudent = useCallback(
    async (formData: {
      name: string;
      email: string;
      password: string;
      ktp_number: string;
      phone_number: string;
      place_and_date_of_birth: string;
    }) => {
      try {
        const res = await fetch(`${API_URL}/siakadBlockchain/api/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          return {
            success: false,
            error: data.detail?.message || 'Student registration failed',
          };
        }

        return {
          success: true,
          data: data.data,
          studentId: data.data.id,
          privateKey: data.private_key,
          instruction: data.private_key_instruction
        };
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
    registerStudent,
    logout,
    getUniversities,
    universityId,
  };
}