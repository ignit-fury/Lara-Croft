import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'super_admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/admin-login', { email, password });
      const { token, user: adminUser } = res.data.data;
      localStorage.setItem('admin_token', token);
      setUser(adminUser);
      toast.success('Welcome back');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#ffffff' }}>
      <div className="w-full max-w-md border border-brand-border p-8" style={{ background: '#fafafa' }}>
        <div className="text-center mb-8">
          <h1 className="text-[11px] font-bold uppercase tracking-[3px] text-brand-accent mb-1">Lara Croft</h1>
          <h2 className="text-[22px] font-extrabold uppercase tracking-wide">Admin Access</h2>
          <p className="text-[13px] text-brand-muted mt-2">Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-muted block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent"
              placeholder="admin@laracroft.com"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-muted block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent text-brand-cream py-3.5 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-all hover:shadow-[0_8px_24px_rgba(111,68,35,.30)] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-[12px] text-brand-muted hover:text-brand-accent transition-colors uppercase tracking-wide">← Back to Store</a>
        </div>
      </div>
    </div>
  );
}
