import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface OrderEmailData {
  to: string;
  customerName: string;
  orderId: string;
  items: Array<{ name: string; size: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

function formatPrice(paise: number): string {
  return `\u20B9${(paise / 100).toLocaleString('en-IN')}`;
}

function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#333;">${item.name}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#333;">${item.size}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:center;">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
    </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f7f2ec;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#6f4423;padding:24px 32px;text-align:center;">
          <h1 style="color:#f7f2ec;margin:0;font-size:24px;letter-spacing:2px;">PRIMA FACIE</h1>
          <p style="color:#f7f2ec;margin:4px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">LARA CROFT</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#333;margin:0 0 8px;font-size:20px;">Order Confirmed!</h2>
          <p style="color:#666;margin:0 0 24px;font-size:14px;">Hi ${data.customerName}, your order has been placed successfully.</p>
          <div style="background:#f7f2ec;padding:16px;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;color:#666;">Order ID</p>
            <p style="margin:4px 0 0;font-size:15px;color:#6f4423;font-weight:600;">#${data.orderId}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr style="border-bottom:2px solid #6f4423;">
                <th style="padding:12px;text-align:left;font-size:12px;color:#999;text-transform:uppercase;">Item</th>
                <th style="padding:12px;text-align:left;font-size:12px;color:#999;text-transform:uppercase;">Size</th>
                <th style="padding:12px;text-align:center;font-size:12px;color:#999;text-transform:uppercase;">Qty</th>
                <th style="padding:12px;text-align:right;font-size:12px;color:#999;text-transform:uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="text-align:right;margin-bottom:24px;">
            <span style="font-size:18px;font-weight:700;color:#6f4423;">Total: ${formatPrice(data.total)}</span>
          </div>
          <div style="border-top:1px solid #eee;padding-top:24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#999;text-transform:uppercase;">Shipping To</p>
            <p style="margin:0;font-size:14px;color:#333;">
              ${data.shippingAddress.line1}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}
            </p>
          </div>
        </div>
        <div style="background:#f7f2ec;padding:24px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#999;">Questions? Reply to this email or contact us at support@primafacie.in</p>
          <p style="margin:8px 0 0;font-size:11px;color:#ccc;">Prima Facie \u2014 LARA CROFT \u00A9 2026</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.log('SMTP not configured, skipping email');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Prima Facie \u2014 LARA CROFT" <${env.SMTP_USER}>`,
      to: data.to,
      subject: `Order Confirmed #${data.orderId} \u2014 Prima Facie`,
      html: buildOrderConfirmationHtml(data),
    });
    console.log(`Order confirmation email sent to ${data.to}`);
  } catch (error) {
    console.error('Failed to send order email:', error);
  }
}
