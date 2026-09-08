import { useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase';
import api from '../services/api';
import { useUserStore } from '../stores/useUserStore';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { setUser, clearUser } = useUserStore();
  const syncedRef = useRef(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const customerToken = localStorage.getItem('customer_token');

    // JWT auth path (admin or customer)
    if (adminToken || customerToken) {
      api.get('/auth/profile').then((res) => {
        setUser(res.data.data);
      }).catch(() => {
        // Only clear the token type that was used
        if (adminToken) localStorage.removeItem('admin_token');
        if (customerToken) localStorage.removeItem('customer_token');
        clearUser();
      }).finally(() => {
        setLoading(false);
      });
      return;
    }

    // Supabase auth path (Google OAuth)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.access_token) {
        // Validate token is actually usable — not just cached/expired
        const { error: validationError } = await supabase.auth.getUser();
        if (validationError) {
          console.warn('[AUTH] Supabase session invalid, clearing:', validationError.message);
          localStorage.removeItem('supabase_token');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        localStorage.setItem('supabase_token', session.access_token);
        try {
          const res = await api.post('/auth/sync', {
            supabaseId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
            avatar: session.user.user_metadata?.avatar_url,
          });
          setUser(res.data.data);
          syncedRef.current = true;
        } catch (err) {
          console.error('Failed to sync user with DB:', err);
          setUser({
            id: session.user.id,
            supabaseId: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url || '',
            role: 'user' as const,
            addresses: [],
            preferences: { newsletter: true, notifications: true },
            createdAt: new Date().toISOString(),
          } as any);
          syncedRef.current = true;
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
        if (syncedRef.current) {
          syncedRef.current = false;
          return;
        }
        localStorage.setItem('supabase_token', session.access_token);
        try {
          const res = await api.post('/auth/sync', {
            supabaseId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
            avatar: session.user.user_metadata?.avatar_url,
          });
          setUser(res.data.data);
        } catch (err) {
          console.error('Failed to sync user with DB:', err);
          setUser({
            id: session.user.id,
            supabaseId: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url || '',
            role: 'user' as const,
            addresses: [],
            preferences: { newsletter: true, notifications: true },
            createdAt: new Date().toISOString(),
          } as any);
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        localStorage.setItem('supabase_token', session.access_token);
      } else if (event === 'SIGNED_OUT') {
        // Only clear Supabase auth — don't clobber JWT (customer/admin) sessions
        localStorage.removeItem('supabase_token');
        if (!localStorage.getItem('admin_token') && !localStorage.getItem('customer_token')) {
          clearUser();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, clearUser]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('customer_token');
    clearUser();
  };

  return { loading, signInWithGoogle, signOut };
}
