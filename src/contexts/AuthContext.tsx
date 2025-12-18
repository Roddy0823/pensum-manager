import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  loginSchema,
  registerSchema,
  checkRateLimit,
  resetRateLimit,
  validateData
} from '@/lib/validation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

interface AuthError extends Error {
  code?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Error messages in Spanish
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'invalid_credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
  'email_not_confirmed': 'Debes confirmar tu email antes de iniciar sesión.',
  'user_not_found': 'No existe una cuenta con este email.',
  'email_exists': 'Este email ya está registrado.',
  'weak_password': 'La contraseña es muy débil. Usa al menos 6 caracteres.',
  'rate_limit': 'Demasiados intentos. Espera un momento antes de intentar de nuevo.',
  'network_error': 'Error de conexión. Verifica tu internet.',
  'session_expired': 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  'default': 'Ha ocurrido un error. Intenta de nuevo.',
};

function getErrorMessage(error: AuthError | null): string {
  if (!error) return AUTH_ERROR_MESSAGES.default;

  const message = error.message?.toLowerCase() || '';

  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }
  if (message.includes('email not confirmed')) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }
  if (message.includes('user not found')) {
    return AUTH_ERROR_MESSAGES.user_not_found;
  }
  if (message.includes('already registered') || message.includes('email_exists')) {
    return AUTH_ERROR_MESSAGES.email_exists;
  }
  if (message.includes('weak password')) {
    return AUTH_ERROR_MESSAGES.weak_password;
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return AUTH_ERROR_MESSAGES.rate_limit;
  }
  if (message.includes('network') || message.includes('fetch')) {
    return AUTH_ERROR_MESSAGES.network_error;
  }
  if (message.includes('session') || message.includes('expired')) {
    return AUTH_ERROR_MESSAGES.session_expired;
  }

  return AUTH_ERROR_MESSAGES.default;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }

        if (event === 'SIGNED_OUT') {
          // Clear any local state or cache
          setUser(null);
          setSession(null);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error('Error getting session:', error);
      }

      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error('Error refreshing session:', error);
      // If refresh fails, sign out
      await signOut();
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    // Validate input
    const validation = validateData(registerSchema, { email, password, fullName });
    if (!validation.success) {
      return { error: new Error(validation.error) };
    }

    // Check rate limit
    const rateLimit = checkRateLimit(`signup_${email}`, 3, 60000);
    if (!rateLimit.allowed) {
      const waitTime = Math.ceil(rateLimit.resetIn / 1000);
      return {
        error: new Error(`Demasiados intentos. Espera ${waitTime} segundos.`)
      };
    }

    const redirectUrl = `${window.location.origin}/dashboard`;

    try {
      const { error } = await supabase.auth.signUp({
        email: validation.data!.email,
        password: validation.data!.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: validation.data!.fullName
          }
        }
      });

      if (error) {
        return { error: new Error(getErrorMessage(error as AuthError)) };
      }

      // Reset rate limit on success
      resetRateLimit(`signup_${email}`);
      return { error: null };
    } catch (err) {
      return { error: new Error(AUTH_ERROR_MESSAGES.network_error) };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Validate input
    const validation = validateData(loginSchema, { email, password });
    if (!validation.success) {
      return { error: new Error(validation.error) };
    }

    // Check rate limit (5 attempts per minute per email)
    const rateLimit = checkRateLimit(`signin_${email}`, 5, 60000);
    if (!rateLimit.allowed) {
      const waitTime = Math.ceil(rateLimit.resetIn / 1000);
      return {
        error: new Error(`Demasiados intentos. Espera ${waitTime} segundos.`)
      };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: validation.data!.email,
        password: validation.data!.password
      });

      if (error) {
        return { error: new Error(getErrorMessage(error as AuthError)) };
      }

      // Reset rate limit on success
      resetRateLimit(`signin_${email}`);
      return { error: null };
    } catch (err) {
      return { error: new Error(AUTH_ERROR_MESSAGES.network_error) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setSession(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
