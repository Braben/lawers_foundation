'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
// @ts-ignore
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  token: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const t = await u.getIdToken();
        setToken(t);
        localStorage.setItem('lf_token', t);
      } else {
        setToken(null);
        localStorage.removeItem('lf_token');
      }
      setLoading(false);
    });
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  const logout = async () => { await signOut(auth); };

  return <AuthContext.Provider value={{ user, loading, token, signInWithEmail, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
