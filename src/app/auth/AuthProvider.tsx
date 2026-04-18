'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export type AppRole = 'owner' | 'manager' | 'cashier' | 'staff';

type AuthContextValue = {
  user: any | null;
  role: AppRole;
  shopId: string | null;
  organizationId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveRole(user: any | null): AppRole {
  const roleCandidate = user?.app_metadata?.role ?? user?.user_metadata?.role;
  if (roleCandidate === 'owner' || roleCandidate === 'manager' || roleCandidate === 'cashier' || roleCandidate === 'staff') {
    return roleCandidate;
  }
  return 'staff';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<AppRole>('staff');
  const [shopId, setShopId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Session bootstrap timeout')), timeoutMs),
        ),
      ]);
    };

    const applyServerContext = async (sessionUser: any | null) => {
      if (!sessionUser) {
        setUser(null);
        setRole('staff');
        setShopId(null);
        setOrganizationId(null);
        return;
      }

      try {
        const context = await withTimeout(api.getMe(), 8000);
        setUser(sessionUser);
        setRole((context?.role as AppRole) || resolveRole(sessionUser));
        setShopId(context?.shopId || null);
        setOrganizationId(null);
      } catch {
        setUser(sessionUser);
        setRole(resolveRole(sessionUser));
        setShopId(null);
        setOrganizationId(null);
      }
    };

    const syncSession = async () => {
      try {
        const { data, error } = await withTimeout(supabase.auth.getSession(), 8000);
        if (error) throw error;
        if (!mounted) return;
        const currentUser = data.session?.user ?? null;
        await applyServerContext(currentUser);
      } catch (err: any) {
        console.warn("Auth sync issue:", err.message);
        // If the token is invalid, clear local session to force a fresh login
        if (err.message?.includes('Refresh Token Not Found') || err.message?.includes('invalid_refresh_token')) {
          await supabase.auth.signOut();
        }
        if (mounted) {
          setUser(null);
          setRole('staff');
          setShopId(null);
          setOrganizationId(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Session refreshed successfully');
        }
        if (event === 'SIGNED_OUT') {
          await applyServerContext(null);
          return;
        }

        const currentUser = session?.user ?? null;
        await applyServerContext(currentUser);
      } catch (err: any) {
        console.error("Auth change error:", err);
        setUser(null);
        setRole('staff');
        setShopId(null);
        setOrganizationId(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      shopId,
      organizationId,
      loading,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
      },
      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
      },
    }),
    [user, role, shopId, organizationId, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
