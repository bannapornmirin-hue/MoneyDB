import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logoutUser, testConnection } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Run connection test on mount as required by Firebase skill
    testConnection();

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (authError) => {
        console.error('Auth state change error:', authError);
        setError(authError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await logoutUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ออกจากระบบไม่สำเร็จ';
      setError(msg);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
