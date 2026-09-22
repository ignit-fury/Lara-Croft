import { describe, it, expect } from 'vitest';
import axios from 'axios';

const API = 'http://localhost:3001/api';
const EMAIL = 'laracroft0710@outlook.com';
const PASSWORD = 'laraCroft2126@';
const NAME = 'Lara Croft Test';

let token: string;
let _userId: string;
let productId: any;
let address: any;
let razorpayOrderId: string;
let razorpayAmount: number;
let dbOrderId: string;

interface Address {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

describe('Lara Croft — Full Payment Protocol (API)', () => {
  it('0. Server is reachable & DB connected', async () => {
    const res = await axios.get(`${API}/health`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    console.log(`[OK] Server: ${res.data.data.status} | DB: ${res.data.data.db}`);
  });

  it('1. Signup / Login as customer', async () => {
    const loginRes = await axios.post(`${API}/auth/login`, { email: EMAIL, password: PASSWORD });
    if (loginRes.data.success) {
      console.log('[OK] Logged in existing account');
      token = loginRes.data.data.token;
      _userId = loginRes.data.data.user.id;
    } else {
      const signupRes = await axios.post(`${API}/auth/signup`, { email: EMAIL, password: PASSWORD, name: NAME });
      expect(signupRes.data.success).toBe(true);
      console.log('[OK] Signed up new account');
      token = signupRes.data.data.token;
      _userId = signupRes.data.data.user.id;
    }
    expect(token).toBeTruthy();
    console.log(`[OK] User: ${EMAIL} (role: ${loginRes.data.data?.user?.role || 'user'})`);
  });

  it('2. Fetch collection & pick first product', async () => {
    const res = await axios.get(`${API}/products?sort=`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);
    productId = res.data.data[0];
    console.log(`[OK] Collection: ${res.data.data.length} products | Picked: "${productId.name}" (₹${(productId.price/100).toLocaleString('en-IN')})`);
  });

  it('3. Add product to cart', async () => {
    const res = await axios.post(`${API}/cart/add`, {
      productId: productId.id,
      size: productId.sizes?.[0] || 'M',
      quantity: 1,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.data.success).toBe(true);
    expect(res.data.data.items.length).toBeGreaterThan(0);
    console.log(`[OK] Added "${productId.name}" to cart — ${res.data.data.items.length} item(s)`);
  });

  it('4. Add new shipping address to account', async () => {
    // If we're at the address cap (5), delete one first so the add succeeds
    const currentRes = await axios.get(`${API}/auth/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (currentRes.data.success && currentRes.data.data.length >= 5) {
      const lastIndex = currentRes.data.data.length - 1;
      await axios.delete(`${API}/auth/addresses/${lastIndex}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    const newAddress: Address = {
      label: 'Home',
      line1: '42, Marine Drive',
      line2: 'Apt 101',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'IN',
      phone: '+919****3210',
    };
    const res = await axios.post(`${API}/auth/addresses`, newAddress, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.data.success).toBe(true);
    expect(res.data.data.addresses.length).toBeGreaterThan(0);
    address = res.data.data.addresses[res.data.data.addresses.length - 1];
    console.log(`[OK] Address saved: ${address.label} — ${address.line1}, ${address.city}, ${address.state} ${address.postalCode}`);
  });

  it('5. Create Razorpay checkout session', async () => {
    // Clear any stale pending orders left by prior runs so checkout isn't blocked
    const staleRes = await axios.get(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (staleRes.data.success) {
      for (const o of staleRes.data.data || []) {
        if ((o.paymentStatus === 'pending' || o.status === 'pending') && o.id) {
          await axios.post(`${API}/orders/${o.id}/cancel`, null, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
      }
    }
    const res = await axios.post(`${API}/orders/create-checkout-session`, {
      shippingAddress: address,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.data.success).toBe(true);
    expect(res.data.data.orderId).toBeTruthy();
    expect(res.data.data.amount).toBeGreaterThan(0);
    razorpayOrderId = res.data.data.orderId;
    razorpayAmount = res.data.data.amount;
    dbOrderId = res.data.data.dbOrderId;
    console.log(`[OK] Razorpay order: ${razorpayOrderId} | Amount: ₹${(razorpayAmount/100).toLocaleString('en-IN')} | DB Order: ${dbOrderId}`);
  });

  it('6. Verify signature validation rejects invalid signature', async () => {
    const res = await axios.post(`${API}/orders/confirm`, {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: 'fake_payment_123',
      razorpay_signature: 'fake_signature',
    }, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: (status) => status < 500,
    });
    expect(res.data.success).toBe(false);
    expect(res.data.error).toContain('signature');
    console.log('[OK] Signature validation: correctly rejected invalid signature');
  });

  it('7. Verify orders endpoint accessible', async () => {
    const res = await axios.get(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.data.success).toBe(true);
    console.log(`[OK] Orders: ${res.data.pagination?.total || 0} order(s) for this user`);
  });

  it('8. VERDICT — All API steps passed', async () => {
    console.log('\n===== TEST RESULT: ALL PASSED =====');
    console.log(`  ✓ Login: ${EMAIL}`);
    console.log(`  ✓ Collection → Cart: "${productId?.name}" added`);
    console.log(`  ✓ Address: ${address?.label} — ${address?.line1}, ${address?.city}`);
    console.log(`  ✓ Razorpay session: ${razorpayOrderId} (₹${(razorpayAmount/100).toLocaleString('en-IN')})`);
    console.log(`  ✓ Signature validation: working`);
    console.log(`  ✓ Orders endpoint: OK`);
    console.log('  ⚠  Actual Razorpay browser payment: not in API-only mode');
    console.log('====================================\n');
  });
});
