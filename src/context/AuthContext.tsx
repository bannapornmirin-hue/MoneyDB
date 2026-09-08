import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signInWithGoogleRedirect,
  checkRedirectResult,
  signInWithEmail,
  signUpWithEmail,
  logoutUser,
  testConnection,
  formatAuthErrorMessage,
  FormattedAuthError,
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authActionLoading: boolean;
  error: string | null;
  errorInfo: FormattedAuthError | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: () => Promise<void>;
  loginWithGooglePopup: () => Promise<void>;
  loginWithGoogleRedirectMode: () => Promise<void>;
  loginWithEmailPassword: (email: string, pass: string) => Promise<void>;
  registerWithEmailPassword: (email: string, pass: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authActionLoading, setAuthActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<FormattedAuthError | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const openAuthModal = () => {
    setError(null);
    setErrorInfo(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    // Run connection test on mount as required by Firebase skill
    testConnection();

    // Check if coming back from signInWithRedirect
    checkRedirectResult()
      .then((redirectUser) => {
        if (redirectUser) {
          setUser(redirectUser);
          setIsAuthModalOpen(false);
        }
      })
      .catch((err) => {
        const formatted = formatAuthErrorMessage(err);
        setError(formatted.message);
        setErrorInfo(formatted);
        setIsAuthModalOpen(true);
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (authError) => {
        console.error('Auth state change error:', authError);
        const formatted = formatAuthErrorMessage(authError);
        setError(formatted.message);
        setErrorInfo(formatted);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loginWithGooglePopup = async () => {
    try {
      setAuthActionLoading(true);
      setError(null);
      setErrorInfo(null);
      await signInWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      const formatted = formatAuthErrorMessage(err);
      setError(formatted.message);
      setErrorInfo(formatted);
      setIsAuthModalOpen(true);
      throw err;
    } finally {
      setAuthActionLoading(false);
    }
  };

  const loginWithGoogleRedirectMode = async () => {
    try {
      setAuthActionLoading(true);
      setError(null);
      setErrorInfo(null);
      await signInWithGoogleRedirect();
    } catch (err: unknown) {
      const formatted = formatAuthErrorMessage(err);
      setError(formatted.message);
      setErrorInfo(formatted);
      setIsAuthModalOpen(true);
      setAuthActionLoading(false);
      throw err;
    }
  };

  const loginWithEmailPassword = async (email: string, pass: string) => {
    try {
      setAuthActionLoading(true);
      setError(null);
      setErrorInfo(null);
      await signInWithEmail(email, pass);
      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      const formatted = formatAuthErrorMessage(err);
      setError(formatted.message);
      setErrorInfo(formatted);
      throw err;
    } finally {
      setAuthActionLoading(false);
    }
  };

  const registerWithEmailPassword = async (email: string, pass: string, displayName?: string) => {
    try {
      setAuthActionLoading(true);
      setError(null);
      setErrorInfo(null);
      await signUpWithEmail(email, pass, displayName);
      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      const formatted = formatAuthErrorMessage(err);
      setError(formatted.message);
      setErrorInfo(formatted);
      throw err;
    } finally {
      setAuthActionLoading(false);
    }
  };

  const login = async () => {
    // Default login action: open Auth Modal for smooth, reliable sign-in experience
    openAuthModal();
  };

  const logout = async () => {
    try {
      setError(null);
      setErrorInfo(null);
      await logoutUser();
    } catch (err: unknown) {
      const formatted = formatAuthErrorMessage(err);
      setError(formatted.message);
      setErrorInfo(formatted);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
    setErrorInfo(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authActionLoading,
        error,
        errorInfo,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        loginWithGooglePopup,
        loginWithGoogleRedirectMode,
        loginWithEmailPassword,
        registerWithEmailPassword,
        logout,
        clearError,
      }}
    >
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

