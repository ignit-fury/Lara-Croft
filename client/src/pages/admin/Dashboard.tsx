import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useUserStore } from '../../stores/useUserStore';

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

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: any[];
  ordersByStatus: { _id: string; count: number }[];
}

export default function Dashboard() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/admin/login');
      return;
    }
    api.get('/admin/dashboard').then((res) => setStats(res.data.data));
  }, [user, navigate]);

  if (!stats) return <div className="text-brand-muted">Loading...</div>;

  const statusCounts: Record<string, number> = {};
  STATUS_LIST.forEach((s) => (statusCounts[s] = 0));
  stats.ordersByStatus.forEach((s) => (statusCounts[s._id] = s.count));
  const maxCount = Math.max(...Object.values(statusCounts), 1);

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px] mb-7">
        {[
          { label: 'Total orders', value: stats.totalOrders, sub: 'All time' },
          { label: 'Revenue', value: formatPrice(stats.totalRevenue), sub: 'All time' },
          { label: 'Users', value: stats.totalUsers, sub: 'Registered accounts' },
          { label: 'Products', value: stats.totalProducts, sub: 'In catalog' },
        ].map((s) => (
          <div key={s.label} className="bg-brand-card border border-brand-border p-5">
            <div className="text-[12px] uppercase tracking-[1.2px] text-brand-muted font-[700]">{s.label}</div>
            <div className="text-[28px] font-[800] mt-2">{s.value}</div>
            <div className="text-[12px] text-brand-muted mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.6fr] gap-5 items-start">
        {/* Orders by status */}
        <div className="bg-brand-card border border-brand-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
            <div className="text-[15px] font-[700]">Orders by status</div>
          </div>
          <div className="p-5">
            {STATUS_LIST.map((s) => (
              <div key={s} className="flex items-center gap-3 py-2 text-[13px]">
                <span className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[s] }} />
                <span className="flex-1 capitalize font-[600]">{s}</span>
                <span className="flex-[2] h-[6px] bg-black/15 overflow-hidden">
                  <span className="h-full block" style={{ width: `${(statusCounts[s] / maxCount) * 100}%`, background: STATUS_COLOR[s] }} />
                </span>
                <span className="w-[26px] text-right font-[700]">{statusCounts[s]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-brand-card border border-brand-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
            <div className="text-[15px] font-[700]">Recent orders</div>
            <Link to="/admin/orders" className="bg-transparent border border-brand-border text-brand-text px-3 py-1.5 text-[11px] font-[700] uppercase tracking-[1px] hover:bg-black/8 transition-colors">View all</Link>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Order</th>
                <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Customer</th>
                <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Total</th>
                <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Payment</th>
                <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-black/5">
                  <td className="py-3 px-5 font-[700]">{order.id.slice(-8)}</td>
                  <td className="py-3 px-5">{order.user?.name || 'N/A'}</td>
                  <td className="py-3 px-5">{formatPrice(order.total)}</td>
                  <td className="py-3 px-5">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-[700] uppercase tracking-[.5px] text-brand-cream" style={{ background: PAY_COLOR[order.paymentStatus] || '#8a6d3f' }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-[700] uppercase tracking-[.5px] text-brand-cream" style={{ background: STATUS_COLOR[order.status] || '#8a6d3f' }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
