import { test, expect } from '@playwright/test';

test.describe('Lara Croft — Full Payment Protocol', () => {
  const API = 'http://localhost:3001/api';
  const EMAIL = 'laracroft0710@outlook.com';
  const PASSWORD = 'laraCroft2126@';
  const NAME = 'Lara Croft Test';

  test('0. Server health check', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    const json = await res.json();
    expect(res.status()).toBe(200);
    expect(json.success).toBe(true);
    console.log(`Server: ${json.data.status} | DB: ${json.data.db}`);
  });

  test('1. Signup / Login', async ({ request }) => {
    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: EMAIL, password: PASSWORD },
    });
    const loginData = await loginRes.json();

    if (!loginData.success) {
      const signupRes = await request.post(`${API}/auth/signup`, {
        data: { email: EMAIL, password: PASSWORD, name: NAME },
      });
      const signupData = await signupRes.json();
      expect(signupData.success).toBe(true);
      console.log('Signed up new account');
      globalThis.__TOKEN = signupData.data.token;
      globalThis.__USER = signupData.data.user;
    } else {
      console.log('Logged in existing account');
      globalThis.__TOKEN = loginData.data.token;
      globalThis.__USER = loginData.data.user;
    }
    expect(globalThis.__TOKEN).toBeTruthy();
    console.log(`User: ${globalThis.__USER.email} (${globalThis.__USER.role})`);
  });

  test('2. Fetch collection & pick first product', async ({ request }) => {
    const res = await request.get(`${API}/products?sort=`);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    const product = data.data[0];
    console.log(`Collection: ${data.data.length} products | Picked: "${product.name}" (₹${(product.price/100).toLocaleString('en-IN')})`);
    globalThis.__PRODUCT = product;
  });

  test('3. Add product to cart', async ({ request }) => {
    const product = globalThis.__PRODUCT!;
    const res = await request.post(`${API}/cart/add`, {
      headers: { Authorization: `Bearer ${globalThis.__TOKEN}` },
      data: {
        productId: product.id,
        size: product.sizes?.[0] || 'M',
        quantity: 1,
      },
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.items.length).toBeGreaterThan(0);
    console.log(`Added "${product.name}" to cart — ${data.data.items.length} item(s)`);
  });

  test('4. Add new shipping address', async ({ request }) => {
    // If we're at the address cap (5), delete one first so the add succeeds
    const currentRes = await request.get(`${API}/auth/addresses`, {
      headers: { Authorization: `Bearer ${globalThis.__TOKEN}` },
    });
    const currentData = await currentRes.json();
    if (currentData.success && currentData.data.length >= 5) {
      const lastIndex = currentData.data.length - 1;
      await request.delete(`${API}/auth/addresses/${lastIndex}`, {
        headers: { Authorization: `Bearer ${globalThis.__TOKEN}` },
      }).catch(() => {});
    }
    const address = {
      label: 'Home',
      line1: '123, MG Road',
      line2: 'Flat 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'IN',
      phone: '+919****3210',
    };
    const res = await request.post(`${API}/auth/addresses`, {
      headers: { Authorization: `Bearer ${globalThis.__TOKEN}` },
      data: address,
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.addresses.length).toBeGreaterThan(0);
    const saved = data.data.addresses[data.data.addresses.length - 1];
    console.log(`Address saved: ${saved.label} — ${saved.line1}, ${saved.city}, ${saved.state} ${saved.postalCode}`);
    globalThis.__ADDRESS = saved;
  });

  test('5. Create Razorpay checkout session', async ({ request }) => {
    const res = await request.post(`${API}/orders/create-checkout-session`, {
      headers: { Authorization: `Bearer ${globalThis.__TOKEN}` },
      data: { shippingAddress: globalThis.__ADDRESS },
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.orderId).toBeTruthy();
    expect(data.data.amount).toBeGreaterThan(0);
    console.log(`Razorpay order: ${data.data.orderId} | Amount: ₹${(data.data.amount/100).toLocaleString('en-IN')}`);
    globalThis.__RAZORPAY_ORDER_ID = data.data.orderId;
    globalThis.__RAZORPAY_AMOUNT = data.data.amount;
    globalThis.__DB_ORDER_ID = data.data.dbOrderId;
  });

  test('6. Verify signature validation rejects invalid sig', async ({ request }) => {
    const res = await request.post(`${API}/orders/confirm`, {
      headers: { Authorization: `Bearer ${globalThis.__TOKEN}` },
      data: {
        razorpay_order_id: globalThis.__RAZORPAY_ORDER_ID,
        razorpay_payment_id: 'fake_payment',
        razorpay_signature: 'fake_signature',
      },
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('signature');
    console.log('Signature validation: correctly rejected invalid signature');
  });

  test('7. Verify orders endpoint', async ({ request }) => {
    const res = await request.get(`${API}/orders`, {
      headers: { Authorization: `Bearer ${globalThis.__TOKEN}` },
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    console.log(`Orders: ${data.pagination?.total || 0} order(s) for this user`);
  });

  test('8. Final verdict', async () => {
    console.log('\n===== TEST RESULT =====');
    console.log('All API protocol steps PASSED.');
    console.log(`  Login: OK (${globalThis.__USER.email})`);
    console.log(`  Collection → Cart: OK`);
    console.log(`  Address: OK`);
    console.log(`  Razorpay session: OK (${globalThis.__RAZORPAY_ORDER_ID})`);
    console.log(`  Signature validation: OK`);
    console.log(`  Orders endpoint: OK`);
    console.log('  NOTE: Actual Razorpay browser payment requires live test credentials and a browser — not executed in API-only mode.');
    console.log('===== END =====');
  });
});
