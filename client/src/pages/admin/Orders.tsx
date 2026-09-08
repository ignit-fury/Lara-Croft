import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useUserStore } from '../../stores/useUserStore';
import toast from 'react-hot-toast';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

const STATUS_LIST = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLOR: Record<string, string> = {
  pending: '#8a6d3f', confirmed: '#6f7a3f', processing: '#7a5a2f',
  shipped: '#6f4423', delivered: '#4c5a2e', cancelled: '#8a3f3f',
};
const PAY_COLOR: Record<string, string> = {
  paid: '#4c5a2e', pending: '#8a6d3f', failed: '#8a3f3f',
};

export default function AdminOrders() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/admin/login');
      return;
    }
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    api.get(`/admin/orders${params}`).then((res) => {
      setOrders(res.data.data);
      setLoading(false);
    });
  }, [user, navigate, statusFilter]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      setOrders(orders.map((o) => o.id === orderId ? { ...o, status } : o));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="text-brand-muted">Loading...</div>;

  return (
    <div className="bg-brand-card border border-brand-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
        <div className="text-[15px] font-[700]">All orders</div>
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
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Order</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Customer</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Items</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Total</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Payment</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Status</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan={7} className="py-12 text-center text-brand-muted text-[13px]">No orders match this filter.</td></tr>
          ) : orders.map((order: any) => (
            <tr key={order.id} className="border-b border-black/8 hover:bg-black/5">
              <td className="py-3 px-5 font-[700]">{order.id.slice(-8)}</td>
              <td className="py-3 px-5">{order.user?.name || 'N/A'}</td>
              <td className="py-3 px-5">{order.items?.length || 0}</td>
              <td className="py-3 px-5">{formatPrice(order.total)}</td>
              <td className="py-3 px-5">
                <span className="inline-block px-2.5 py-1 text-[11px] font-[700] uppercase tracking-[.5px] text-brand-cream" style={{ background: PAY_COLOR[order.paymentStatus] || '#8a6d3f' }}>
                  {order.paymentStatus}
                </span>
              </td>
              <td className="py-3 px-5">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="bg-white border border-brand-border text-brand-text px-2 py-[7px] text-[12.5px] font-[600] cursor-pointer"
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </td>
              <td className="py-3 px-5 text-brand-muted text-[12px]">
                {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
