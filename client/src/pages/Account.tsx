import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUserStore } from '../stores/useUserStore';
import type { Order } from '../types';
import toast from 'react-hot-toast';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function Account() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    api.get('/orders').then((res) => {
      setOrders(res.data.data);
      setLoading(false);
    });
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">My Account</h1>

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button onClick={() => setActiveTab('orders')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'orders' ? 'border-brand-brown text-brand-brown' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          My Orders
        </button>
        <button onClick={() => setActiveTab('profile')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-brand-brown text-brand-brown' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Profile
        </button>
      </div>

      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <div className="text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No orders yet</p>
              <button onClick={() => navigate('/')} className="bg-brand-brown text-brand-cream px-6 py-3 text-sm font-semibold hover:bg-brand-brown-dark transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs text-gray-400">Order #{order._id.slice(-8)}</span>
                      <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-semibold text-brand-brown">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {order.items?.map((item, i) => (
                      <div key={i} className="w-12 h-16 bg-gray-100">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-md">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Name</label>
              <p className="text-gray-800">{user.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Email</label>
              <p className="text-gray-800">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Role</label>
              <p className="text-gray-800 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
