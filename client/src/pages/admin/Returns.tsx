import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useUserStore } from '../../stores/useUserStore';
import toast from 'react-hot-toast';

const STATUS_LIST = ['pending', 'approved', 'rejected', 'completed'];
const STATUS_COLOR: Record<string, string> = {
  pending: '#8a6d3f', approved: '#4c5a2e', rejected: '#8a3f3f', completed: '#4c5a2e',
};

export default function AdminReturns() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/admin/login');
      return;
    }
    api.get('/admin/returns').then((res) => {
      setRequests(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, navigate]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/admin/returns/${id}/status`, { status });
      setRequests(requests.map((r) => r.id === id ? { ...r, status } : r));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const visible = statusFilter === 'all' ? requests : requests.filter((r) => r.status === statusFilter);

  if (loading) return <div className="text-brand-muted">Loading...</div>;

  return (
    <div className="bg-brand-card border border-brand-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
        <div className="text-[15px] font-[700]">Return & exchange requests</div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-brand-border text-brand-text px-2.5 py-[7px] text-[12.5px] font-[600] cursor-pointer"
        >
          <option value="all">All statuses</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-brand-border">
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Ref</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Order</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Email</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Acct</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Type</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Reason</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Details</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Status</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Date</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr><td colSpan={9} className="py-12 text-center text-brand-muted text-[13px]">No requests match this filter.</td></tr>
          ) : visible.map((r: any) => (
            <tr key={r.id} className="border-b border-black/8 hover:bg-black/5 align-top">
              <td className="py-3 px-5 font-[700]">RET-{r.id.slice(-8).toUpperCase()}</td>
              <td className="py-3 px-5">{r.orderId}</td>
              <td className="py-3 px-5">{r.email}</td>
              <td className="py-3 px-5" title={r.userId || 'guest request'}>
                {r.userId ? <span className="text-[13px] font-[700]" style={{ color: '#4c5a2e' }}>✓</span> : <span className="text-brand-muted text-[12px]">guest</span>}
              </td>
              <td className="py-3 px-5">{r.type}</td>
              <td className="py-3 px-5">{r.reason}</td>
              <td className="py-3 px-5 text-brand-muted text-[12px] max-w-[260px]">{r.details}</td>
              <td className="py-3 px-5">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-1 text-[11px] font-[700] uppercase tracking-[.5px] text-brand-cream" style={{ background: STATUS_COLOR[r.status] || '#8a6d3f' }}>
                    {r.status}
                  </span>
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    className="bg-white border border-brand-border text-brand-text px-2 py-[7px] text-[12.5px] font-[600] cursor-pointer"
                  >
                    {STATUS_LIST.map((s) => (
                      <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="py-3 px-5 text-brand-muted text-[12px]">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
