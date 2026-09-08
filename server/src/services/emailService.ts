import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface OrderEmailData {
  to: string;
  customerName: string;
  orderId: string;
  items: Array<{ name: string; size: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    phone?: string;
  };
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

function formatPrice(paise: number): string {
  return `\u20B9${(paise / 100).toLocaleString('en-IN')}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildOrderEmailHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item, i) => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${i + 1}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;font-weight:600;">${item.name}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;">${item.size}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;text-align:center;">${item.quantity}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;text-align:right;">${formatPrice(item.price)}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;text-align:right;font-weight:600;">${formatPrice(item.price * item.quantity)}</td>
    </tr>`
    )
    .join('');

  const now = new Date();
  const invoiceNo = `INV-${data.orderId.slice(-8).toUpperCase()}`;

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;">
        <div style="background:#6f4423;padding:28px 32px;text-align:center;">
          <h1 style="color:#f7f2ec;margin:0;font-size:26px;letter-spacing:3px;">LARA CROFT</h1>
          <p style="color:rgba(247,242,236,.7);margin:4px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Order Confirmation & Invoice</p>
        </div>
        <div style="background:#f0fdf4;padding:16px 32px;text-align:center;border-bottom:1px solid #e5e7eb;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:600;">✓ Order Placed Successfully</p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 4px;font-size:16px;color:#333;font-weight:600;">Hi ${data.customerName},</p>
          <p style="margin:0 0 28px;font-size:14px;color:#666;">Thank you for your order! Here are your order details and invoice.</p>
          <div style="display:flex;gap:16px;margin-bottom:28px;">
            <div style="flex:1;background:#fafafa;border:1px solid #e5e7eb;padding:16px;">
              <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
              <p style="margin:0;font-size:15px;color:#6f4423;font-weight:700;">#${data.orderId}</p>
            </div>
            <div style="flex:1;background:#fafafa;border:1px solid #e5e7eb;padding:16px;">
              <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Invoice No</p>
              <p style="margin:0;font-size:15px;color:#6f4423;font-weight:700;">${invoiceNo}</p>
            </div>
            <div style="flex:1;background:#fafafa;border:1px solid #e5e7eb;padding:16px;">
              <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Date</p>
              <p style="margin:0;font-size:15px;color:#333;font-weight:600;">${formatDate(now)}</p>
            </div>
          </div>
          <p style="margin:0 0 12px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Items Ordered</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:28px;border:1px solid #e5e7eb;">
            <thead>
              <tr style="background:#fafafa;">
                <th style="padding:12px 16px;text-align:left;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e5e7eb;">#</th>
                <th style="padding:12px 16px;text-align:left;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e5e7eb;">Item</th>
                <th style="padding:12px 16px;text-align:left;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e5e7eb;">Size</th>
                <th style="padding:12px 16px;text-align:center;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e5e7eb;">Qty</th>
                <th style="padding:12px 16px;text-align:right;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e5e7eb;">Price</th>
                <th style="padding:12px 16px;text-align:right;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="background:#fafafa;border:1px solid #e5e7eb;padding:20px;margin-bottom:28px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#666;">Subtotal</td>
                <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;">${formatPrice(data.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#666;">Shipping</td>
                <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;">${data.shipping === 0 ? '<span style="color:#16a34a;font-weight:600;">FREE</span>' : formatPrice(data.shipping)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#666;">Tax (GST 18%)</td>
                <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;">${formatPrice(data.tax)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0 0;font-size:15px;color:#333;font-weight:700;border-top:2px solid #6f4423;">Total Paid</td>
                <td style="padding:10px 0 0;font-size:18px;color:#6f4423;font-weight:700;border-top:2px solid #6f4423;text-align:right;">${formatPrice(data.total)}</td>
              </tr>
            </table>
          </div>
          <div style="margin-bottom:28px;">
            <p style="margin:0 0 10px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Shipping Address</p>
            <div style="background:#fafafa;border:1px solid #e5e7eb;padding:16px;">
              <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
                ${data.customerName}<br>
                ${data.shippingAddress.line1}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}
                ${data.shippingAddress.phone ? `<br>Phone: ${data.shippingAddress.phone}` : ''}
              </p>
            </div>
          </div>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:20px;margin-bottom:28px;">
            <p style="margin:0 0 8px;font-size:13px;color:#1e40af;font-weight:700;">What happens next?</p>
            <p style="margin:0;font-size:13px;color:#333;line-height:1.7;">
              1. Your order is being processed<br>
              2. You'll receive a shipping confirmation with tracking details<br>
              3. Estimated delivery: 5-7 business days
            </p>
          </div>
          <p style="margin:0;font-size:13px;color:#666;text-align:center;">
            Questions about your order? Contact us at <a href="mailto:lc8758570@gmail.com" style="color:#6f4423;text-decoration:none;font-weight:600;">lc8758570@gmail.com</a>
          </p>
        </div>
        <div style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#999;">LARA CROFT — Premium Expedition Wear</p>
          <p style="margin:6px 0 0;font-size:11px;color:#ccc;">© 2026 Lara Croft. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.log('[EMAIL] SMTP credentials not configured, skipping email');
    return;
  }

  try {
    const invoiceNo = `INV-${data.orderId.slice(-8).toUpperCase()}`;
    await transporter.sendMail({
      from: env.SMTP_FROM || `LARA CROFT <${env.SMTP_USER}>`,
      to: data.to,
      subject: `Order Confirmed #${data.orderId} — Invoice ${invoiceNo}`,
      html: buildOrderEmailHtml(data),
    });
    console.log(`[EMAIL] Order confirmation + invoice sent to ${data.to}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send:', error);
  }
}
