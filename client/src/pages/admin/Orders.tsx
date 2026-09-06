import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useUserStore } from '../../stores/useUserStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Order } from '../../types';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function AdminOrders() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/');
      return;
    }
    const params = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/admin/orders${params}`).then((res) => {
      setOrders(res.data.data);
      setLoading(false);
    });
  }, [user, navigate, statusFilter]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      setOrders(orders.map((o) => o._id === orderId ? { ...o, status: status as any } : o));
      toast.success('Status updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Orders</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 px-3 py-2 text-sm rounded-none">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Order ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Items</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Total</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Payment</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-800 font-mono text-xs">{order._id.slice(-8)}</td>
                <td className="py-3 px-4 text-gray-600">{(order.user as any)?.name || 'N/A'}</td>
                <td className="py-3 px-4 text-gray-600">{order.items?.length || 0}</td>
                <td className="py-3 px-4 text-gray-800 font-medium">{formatPrice(order.total)}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} className="border border-gray-300 px-2 py-1 text-xs rounded-none">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
