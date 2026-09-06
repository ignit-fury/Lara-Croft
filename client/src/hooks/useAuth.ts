import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import api from '../services/api';
import { useUserStore } from '../stores/useUserStore';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.access_token) {
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
          console.error('Failed to sync user:', err);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.access_token) {
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
          console.error('Failed to sync user:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('supabase_token');
        clearUser();
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
    clearUser();
  };

  return { loading, signInWithGoogle, signOut };
}
