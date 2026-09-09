import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useUserStore } from '../stores/useUserStore';
import toast from 'react-hot-toast';
import type { Order, Address } from '../types';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

const emptyAddress: Address = {
  label: 'Home',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'IN',
  phone: '',
};

export default function Account() {
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [addressForm, setAddressForm] = useState<Address>({ ...emptyAddress });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/orders').then((res) => {
      setOrders(res.data.data);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api.get('/auth/addresses').then((res) => {
      setAddresses(res.data.data);
    });
  }, [user]);

  const handleAddAddress = async () => {
    if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.postalCode || !addressForm.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/auth/addresses', addressForm);
      if (res.data.data?.addresses) {
        setAddresses(res.data.data.addresses);
        if (user) setUser({ ...user, addresses: res.data.data.addresses });
      }
      setAddressForm({ ...emptyAddress });
      setShowForm(false);
      toast.success('Address saved');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    try {
      const res = await api.delete(`/auth/addresses/${index}`);
      if (res.data.data?.addresses) {
        setAddresses(res.data.data.addresses);
        if (user) setUser({ ...user, addresses: res.data.data.addresses });
      }
      toast.success('Address removed');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete address');
    }
  };

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <h1 className="text-[28px] font-extrabold text-brand-text uppercase tracking-wide mb-8">My Account</h1>

      <div className="flex gap-6 mb-8 border-b border-brand-border">
        <button onClick={() => setActiveTab('orders')} className={`pb-3 text-[13px] font-bold uppercase tracking-[1px] border-b-2 transition-colors ${activeTab === 'orders' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>
          My Orders
        </button>
        <button onClick={() => setActiveTab('addresses')} className={`pb-3 text-[13px] font-bold uppercase tracking-[1px] border-b-2 transition-colors ${activeTab === 'addresses' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>
          Addresses
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

      {activeTab === 'addresses' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-[13px] text-brand-muted">{addresses.length}/5 addresses saved</p>
            {addresses.length < 5 && (
              <button onClick={() => setShowForm(!showForm)} className="bg-brand-accent text-brand-cream px-5 py-2.5 text-[13px] font-bold uppercase tracking-[1px] hover:bg-brand-accent2 transition-colors">
                {showForm ? 'Cancel' : 'Add New Address'}
              </button>
            )}
          </div>

          {showForm && (
            <div className="border border-brand-border p-5 mb-6" style={{ background: '#fafafa' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-4">New Address</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Label (e.g. Home)" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
                <input type="text" placeholder="Address Line 1 *" value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
                <input type="text" placeholder="Address Line 2" value={addressForm.line2} onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })} className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="City *" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
                  <input type="text" placeholder="State *" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
                  <input type="text" placeholder="PIN Code *" value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} className="border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
                  <input type="tel" placeholder="Phone *" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
                </div>
                <button onClick={handleAddAddress} disabled={saving} className="bg-brand-accent text-brand-cream px-6 py-3 text-[13px] font-bold uppercase tracking-[1px] hover:bg-brand-accent2 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </div>
          )}

          {addresses.length === 0 && !showForm ? (
            <div className="text-center py-12">
              <p className="text-brand-muted text-[14px]">No saved addresses</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr, i) => (
                <div key={i} className="border border-brand-border p-4 relative" style={{ background: '#fafafa' }}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-[2px] text-brand-accent">{addr.label}</span>
                    <button onClick={() => handleDeleteAddress(i)} className="text-[11px] text-red-600 hover:text-red-800 uppercase tracking-[1px] font-bold">
                      Delete
                    </button>
                  </div>
                  <p className="text-[13px] text-brand-text">{addr.line1}</p>
                  {addr.line2 && <p className="text-[13px] text-brand-text">{addr.line2}</p>}
                  <p className="text-[13px] text-brand-text">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-[13px] text-brand-text">{addr.country}</p>
                  <p className="text-[13px] text-brand-muted mt-1">{addr.phone}</p>
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
