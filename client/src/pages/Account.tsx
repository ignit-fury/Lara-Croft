import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { useUserStore } from '../stores/useUserStore';
import type { Order } from '../types';
import toast from 'react-hot-toast';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function Account() {
  const { user } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  useEffect(() => {
    if (!user) return;
    api.get('/orders').then((res) => {
      setOrders(res.data.data);
      setLoading(false);
    });
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <h1 className="text-[28px] font-extrabold text-brand-text uppercase tracking-wide mb-8">My Account</h1>

      <div className="flex gap-6 mb-8 border-b border-brand-border">
        <button onClick={() => setActiveTab('orders')} className={`pb-3 text-[13px] font-bold uppercase tracking-[1px] border-b-2 transition-colors ${activeTab === 'orders' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>
          My Orders
        </button>
        <button onClick={() => setActiveTab('profile')} className={`pb-3 text-[13px] font-bold uppercase tracking-[1px] border-b-2 transition-colors ${activeTab === 'profile' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>
          Profile
        </button>
      </div>

      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <div className="text-brand-muted text-[14px]">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brand-muted text-[14px] mb-4">No orders yet</p>
              <button onClick={() => navigate('/')} className="bg-brand-accent text-brand-cream px-7 py-3.5 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border border-brand-border p-4" style={{ background: '#fafafa' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[11px] text-brand-muted">Order #{order.id.slice(-8)}</span>
                      <p className="text-[13px] text-brand-muted">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] px-2.5 py-1 font-semibold uppercase tracking-wide ${order.status === 'delivered' ? 'bg-brand-accent text-brand-cream' : order.status === 'cancelled' ? 'bg-red-800 text-brand-cream' : 'bg-brand-accent2 text-brand-cream'}`}>
                        {order.status}
                      </span>
                      <span className="text-[15px] font-bold">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {order.items?.map((item, i) => (
                      <div key={i} className="w-12 h-16 overflow-hidden" style={{ background: '#efefef' }}>
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
              <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-muted block mb-1">Name</label>
              <p className="text-brand-text">{user.name}</p>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-muted block mb-1">Email</label>
              <p className="text-brand-text">{user.email}</p>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[2px] text-brand-muted block mb-1">Role</label>
              <p className="text-brand-text capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
