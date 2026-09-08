import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { supabase } from '../services/supabase';
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';

export default function CustomerAuth() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useUserStore();
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const body = isSignup ? { email, password, name } : { email, password };
      const res = await api.post(endpoint, body);
      const { token, user } = res.data.data;
      localStorage.setItem('customer_token', token);
      setUser(user);
      toast.success(isSignup ? 'Account created!' : 'Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#ffffff' }}>
      <div className="w-full max-w-md border border-brand-border p-8" style={{ background: '#fafafa' }}>
        <div className="text-center mb-8">
          <Link to="/" className="text-[11px] font-bold uppercase tracking-[3px] text-brand-accent mb-1 block">Lara Croft</Link>
          <h2 className="text-[22px] font-extrabold uppercase tracking-wide">{isSignup ? 'Create Account' : 'Sign In'}</h2>
          <p className="text-[13px] text-brand-muted mt-2">{isSignup ? 'Join the expedition' : 'Welcome back, explorer'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-muted block mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-muted block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-muted block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent text-brand-cream py-3.5 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)] disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-brand-border"></div>
          <span className="text-[11px] uppercase tracking-[1px] text-brand-muted">or</span>
          <div className="flex-1 h-px bg-brand-border"></div>
        </div>

        <button
          onClick={signInWithGoogle}
          className="mt-4 w-full border border-brand-border bg-brand-card text-brand-text py-3.5 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-surface transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-[13px] text-brand-muted hover:text-brand-accent transition-colors"
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-[12px] text-brand-muted hover:text-brand-accent transition-colors uppercase tracking-wide">← Back to Store</Link>
        </div>
      </div>
    </div>
  );
}
