import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useUserStore } from '../../stores/useUserStore';
import { useNavigate } from 'react-router-dom';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/');
      return;
    }
    api.get('/admin/dashboard').then((res) => {
      setStats(res.data.data);
      setLoading(false);
    });
  }, [user, navigate]);

  if (loading || !stats) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
        </div>
        <div className="p-6 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-brand-brown">{formatPrice(stats.totalRevenue)}</p>
        </div>
        <div className="p-6 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
        </div>
        <div className="p-6 bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
        </div>
      </div>

      {/* Order Status */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.ordersByStatus.map((s) => (
            <div key={s._id} className="p-4 border border-gray-200">
              <p className="text-sm text-gray-500 capitalize">{s._id}</p>
              <p className="text-xl font-bold text-gray-800">{s.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-800">{order._id.slice(-8)}</td>
                  <td className="py-3 px-4 text-gray-600">{order.user?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-800">{formatPrice(order.total)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
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
