import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../stores/useCartStore';
import { useGuestCartStore } from '../stores/useGuestCartStore';
import { useUserStore } from '../stores/useUserStore';
import { useCurrencyStore } from '../stores/useCurrencyStore';
import { useGuestSession } from '../hooks/useGuestSession';
import toast from 'react-hot-toast';
import type { Address } from '../types';
import { formatPrice } from '../utils/formatPrice';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const { currency } = useCurrencyStore();
  const { guestSessionId } = useGuestSession();
  const isGuest = !user;

  const authItems = useCartStore((s) => s.items);
  const authTotal = useCartStore((s) => s.total);
  const authClearCart = useCartStore((s) => s.clearCart);

  const guestItems = useGuestCartStore((s) => s.items);
  const guestTotal = useGuestCartStore((s) => s.total);
  const guestClearCart = useGuestCartStore((s) => s.clearCart);
  const fetchGuestCart = useGuestCartStore((s) => s.fetchCart);

  const items = isGuest ? guestItems : authItems;
  const total = isGuest ? guestTotal : authTotal;
  const clearCart = isGuest ? guestClearCart : authClearCart;

  const [loading, setLoading] = useState(false);
  const processingRef = useRef(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedSavedIndex, setSelectedSavedIndex] = useState<number | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);

  const [guestInfo, setGuestInfo] = useState({ email: '', name: '', phone: '' });
  const [address, setAddress] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      fetchGuestCart(guestSessionId);
    }
  }, [user, guestSessionId, fetchGuestCart]);

  useEffect(() => {
    if (!user) return;
    api.get('/auth/addresses').then((res) => {
      setSavedAddresses(res.data.data);
    });
  }, [user]);

  const selectSavedAddress = (index: number) => {
    const addr = savedAddresses[index];
    setSelectedSavedIndex(index);
    setAddress({
      label: addr.label,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
    });
  };

  const useNewAddress = () => {
    setSelectedSavedIndex(null);
    setAddress({
      label: 'Home',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'IN',
      phone: '',
    });
  };

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (processingRef.current) return;

    if (!address.line1 || !address.city || !address.state || !address.postalCode || !address.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    if (isGuest) {
      if (!guestInfo.email || !guestInfo.name || !guestInfo.phone) {
        toast.error('Please fill email, name, and phone');
        return;
      }
      address.phone = guestInfo.phone;
    }

    processingRef.current = true;
    setLoading(true);

    try {
      if (!isGuest && saveAddress && selectedSavedIndex === null) {
        try {
          const res = await api.post('/auth/addresses', address);
          if (user && res.data.data?.addresses) {
            setUser({ ...user, addresses: res.data.data.addresses });
          }
          toast.success('Address saved to your account');
        } catch {
          // continue even if save fails
        }
      }

      let orderId: string;
      let amount: number;

      if (isGuest) {
        const res: any = await api.post('/orders/guest-checkout', {
          email: guestInfo.email,
          name: guestInfo.name,
          phone: guestInfo.phone,
          shippingAddress: address,
          items: items.map((i) => ({
            product_id: i.product_id,
            size: i.size,
            quantity: i.quantity,
            name: i.name,
            price: i.price,
            image: i.image,
          })),
          guestSessionId,
        });
        orderId = res.data.data.orderId;
        amount = res.data.data.amount;
      } else {
        const res: any = await api.post('/orders/create-checkout-session', { shippingAddress: address });
        orderId = res.data.data.orderId;
        amount = res.data.data.amount;
      }

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load Razorpay');
        processingRef.current = false;
        setLoading(false);
        return;
      }

      const prefillData: any = {};
      if (isGuest) {
        prefillData.name = guestInfo.name;
        prefillData.email = guestInfo.email;
        prefillData.contact = guestInfo.phone;
      } else {
        prefillData.name = user?.name || '';
        prefillData.email = user?.email || '';
        prefillData.contact = address.phone;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'Lara Croft',
        order_id: orderId,
        handler: async (response: any) => {
          try {
            if (isGuest) {
              await api.post('/orders/guest-confirm', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                guestSessionId,
              });
            } else {
              await api.post('/orders/confirm', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            }
            clearCart();
            navigate('/checkout/success');
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
            processingRef.current = false;
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            processingRef.current = false;
            setLoading(false);
          },
        },
        prefill: prefillData,
        theme: {
          color: '#6f4423',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
      processingRef.current = false;
      setLoading(false);
    }
  };

  const subtotal = total();
  const shipping = subtotal >= 500000 ? 0 : 49900;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <h1 className="text-[28px] font-extrabold text-brand-text uppercase tracking-wide mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isGuest && (
            <div className="mb-6 p-4 border border-brand-border bg-brand-card">
              <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-4">Guest Information</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                  className="w-full border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent"
                />
              </div>
              <p className="text-[11px] text-brand-muted mt-2">You'll receive order confirmation at this email.</p>
            </div>
          )}

          <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-4">Shipping Address</h2>

          {!isGuest && savedAddresses.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-3 mb-3">
                {savedAddresses.map((addr, i) => (
                  <button
                    key={i}
                    onClick={() => selectSavedAddress(i)}
                    className={`text-left border p-3 flex-1 transition-colors ${selectedSavedIndex === i ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-border hover:border-brand-muted'}`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-[1px] text-brand-accent block mb-1">{addr.label}</span>
                    <p className="text-[12px] text-brand-text leading-tight">{addr.line1}</p>
                    <p className="text-[12px] text-brand-text leading-tight">{addr.city}, {addr.state}</p>
                  </button>
                ))}
                <button
                  onClick={useNewAddress}
                  className={`text-center border p-3 flex-1 transition-colors ${selectedSavedIndex === null ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-border hover:border-brand-muted'}`}
                >
                  <span className="text-[12px] text-brand-muted">+ New Address</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Label (e.g. Home)" value={address.label} onChange={(e) => setAddress({ ...address, label: e.target.value })} className="col-span-2 border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
              <input type="text" placeholder="Address Line 1 *" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="col-span-2 border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
              <input type="text" placeholder="Address Line 2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className="col-span-2 border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
              <input type="text" placeholder="City *" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
              <input type="text" placeholder="State *" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
              <input type="text" placeholder="PIN Code *" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
              <input type="tel" placeholder="Phone *" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="border border-brand-border bg-brand-card text-brand-text px-4 py-3 text-[13px] focus:outline-none focus:border-brand-accent" />
            </div>
            {!isGuest && selectedSavedIndex === null && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-4 h-4 accent-brand-accent" />
                <span className="text-[13px] text-brand-muted">Save this address for future orders</span>
              </label>
            )}
          </div>
        </div>

        <div className="p-6 border border-brand-border h-fit" style={{ background: '#fafafa' }}>
          <h2 className="text-[11px] font-bold uppercase tracking-[2px] text-brand-text mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item: any) => (
              <div key={`${item.product_id || item.product?.id}-${item.size}`} className="flex justify-between text-[13px]">
                <span className="text-brand-muted">{item.name || item.product?.name} x{item.quantity}</span>
                <span>{formatPrice((item.price || item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-border pt-3 space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-brand-muted">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-brand-muted">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span className="text-brand-muted">Tax (GST 18%)</span><span>{formatPrice(tax)}</span></div>
            <div className="border-t border-brand-border pt-2 flex justify-between font-semibold">
              <span>Total</span><span className="text-brand-text">{formatPrice(grandTotal)}</span>
            </div>
            <div className="text-[11px] text-brand-muted mt-1">
              Payment processed in INR ({formatPrice(grandTotal, 'INR')})
            </div>
            {currency !== 'INR' && (
              <div className="text-[11px] text-brand-muted mt-1">
                You will be charged {formatPrice(grandTotal, 'INR')} (converted from {currency} {formatPrice(grandTotal)})
              </div>
            )}
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-brand-accent text-brand-cream py-3.5 text-[13px] font-bold uppercase tracking-[2px] hover:bg-brand-accent2 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay with Razorpay'}
          </button>
        </div>
      </div>
    </div>
  );
}
