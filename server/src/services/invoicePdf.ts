import PDFDocument from 'pdfkit';

export interface InvoiceData {
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
  invoiceNo: string;
}

function formatPrice(paise: number): string {
  return `\u20B9${(paise / 100).toLocaleString('en-IN')}`;
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const brown = '#6f4423';
    const darkText = '#333333';
    const mutedText = '#666666';
    const lightBg = '#f5f5f5';
    const pageWidth = doc.page.width - 100;

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill(brown);
    doc.fontSize(22).fillColor('#f7f2ec').font('Helvetica-Bold')
      .text('LARA CROFT', 50, 25, { align: 'center' });
    doc.fontSize(9).fillColor('rgba(247,242,236,.7)').font('Helvetica')
      .text('PREMIUM EXPEDITION WEAR', 50, 52, { align: 'center' });

    // Invoice info
    let y = 100;
    doc.fontSize(10).fillColor(mutedText).font('Helvetica')
      .text('INVOICE', 50, y);
    y += 18;
    doc.fontSize(9).fillColor(darkText).font('Helvetica-Bold')
      .text(`Invoice No: ${data.invoiceNo}`, 50, y);
    doc.text(`Order ID: #${data.orderId}`, 50, y + 14);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 50, y + 28);

    y += 50;

    // Items table header
    doc.rect(50, y, pageWidth, 20).fill(lightBg);
    y += 5;
    const colX = [55, 75, 280, 340, 390, 460];
    doc.fontSize(8).fillColor(mutedText).font('Helvetica-Bold');
    doc.text('#', colX[0], y);
    doc.text('Item', colX[1], y);
    doc.text('Size', colX[2], y);
    doc.text('Qty', colX[3], y, { width: 40, align: 'right' });
    doc.text('Price', colX[4], y, { width: 60, align: 'right' });
    doc.text('Total', colX[5], y, { width: 70, align: 'right' });
    y += 20;

    // Items
    doc.font('Helvetica').fontSize(9);
    data.items.forEach((item, i) => {
      const itemTotal = item.price * item.quantity;
      doc.fillColor(darkText);
      doc.text(`${i + 1}`, colX[0], y);
      doc.font('Helvetica-Bold').text(item.name, colX[1], y, { width: 195 });
      doc.font('Helvetica').text(item.size, colX[2], y);
      doc.text(`${item.quantity}`, colX[3], y, { width: 40, align: 'right' });
      doc.text(formatPrice(item.price), colX[4], y, { width: 60, align: 'right' });
      doc.font('Helvetica-Bold').text(formatPrice(itemTotal), colX[5], y, { width: 70, align: 'right' });
      doc.font('Helvetica');
      y += 18;

      if (i < data.items.length - 1) {
        doc.moveTo(50, y).lineTo(50 + pageWidth, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
        y += 2;
      }
    });

    y += 10;

    // Summary
    const summaryX = 380;
    doc.fontSize(9).font('Helvetica').fillColor(mutedText);
    doc.text('Subtotal', summaryX, y);
    doc.fillColor(darkText).text(formatPrice(data.subtotal), summaryX + 70, y, { width: 70, align: 'right' });
    y += 16;
    doc.fillColor(mutedText).text('Shipping', summaryX, y);
    doc.fillColor(darkText).text(data.shipping === 0 ? 'FREE' : formatPrice(data.shipping), summaryX + 70, y, { width: 70, align: 'right' });
    y += 16;
    doc.fillColor(mutedText).text('Tax (GST 18%)', summaryX, y);
    doc.fillColor(darkText).text(formatPrice(data.tax), summaryX + 70, y, { width: 70, align: 'right' });
    y += 6;
    doc.moveTo(summaryX, y).lineTo(summaryX + 150, y).strokeColor(brown).lineWidth(1.5).stroke();
    y += 6;
    doc.fontSize(11).font('Helvetica-Bold').fillColor(brown);
    doc.text('Total Paid', summaryX, y);
    doc.text(formatPrice(data.total), summaryX + 70, y, { width: 70, align: 'right' });

    y += 30;

    // Shipping address
    doc.fontSize(9).font('Helvetica-Bold').fillColor(mutedText)
      .text('SHIPPING ADDRESS', 50, y);
    y += 16;
    doc.fontSize(9).font('Helvetica').fillColor(darkText)
      .text(data.customerName, 50, y);
    y += 14;
    doc.text(data.shippingAddress.line1, 50, y);
    y += 14;
    doc.text(`${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}`, 50, y);
    if (data.shippingAddress.phone) {
      y += 14;
      doc.text(`Phone: ${data.shippingAddress.phone}`, 50, y);
    }

    // Footer
    doc.fontSize(8).fillColor(mutedText).font('Helvetica')
      .text('Questions? Contact us at lc8758570@gmail.com', 50, doc.page.height - 60, { align: 'center', width: pageWidth });
    doc.text('LARA CROFT \u2014 Premium Expedition Wear', 50, doc.page.height - 48, { align: 'center', width: pageWidth });

    doc.end();
  });
}
