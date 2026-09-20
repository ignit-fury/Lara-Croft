# Task 1: Order Summary Email with Invoice PDF — Report

## Status: DONE

## Summary of Changes

### 1. Dependencies
- Added `pdfkit` to `server/package.json` dependencies
- Added `@types/pdfkit` to `server/package.json` devDependencies

### 2. New File: `server/src/services/invoicePdf.ts`
- Exports `InvoiceData` interface (extends `OrderEmailData` with `invoiceNo` and `orderId`)
- Exports `generateInvoicePdf(data: InvoiceData): Promise<Buffer>` — pure function, no side effects
- PDF layout:
  - Header: "LARA CROFT" branding with brown `#6f4423` background
  - Invoice info: Invoice number (`INV-{last8ofOrderId}`), Order ID, Date
  - Items table: #, Item, Size, Qty, Unit Price, Total
  - Summary: Subtotal, Shipping, Tax (GST 18%), Total Paid
  - Shipping address
  - Footer with contact email
- Prices in INR (₹), formatted with `toLocaleString('en-IN')`
- Uses `pdfkit` for PDF generation, returns `Buffer`

### 3. Modified: `server/src/services/emailService.ts`
- Imported `generateInvoicePdf` and `InvoiceData` from `./invoicePdf`
- In `sendOrderConfirmation()`:
  - Generates PDF before sending email
  - PDF generation failure is caught and logged — does NOT block email
  - Brevo API: PDF attached as `{ content: base64String, name: 'invoice-INV-XXXXXXXX.pdf' }`
  - SMTP: PDF attached as `{ filename: 'invoice-INV-XXXXXXXX.pdf', content: Buffer }`

## Build Results

```
npx tsc --noEmit
(exit code 0, no output = no type errors)
```

## Concerns

None. All constraints met:
- No frontend code modified
- No DB schema changes
- No route/controller changes
- No new env vars
- Existing HTML email unchanged
- Build passes clean
- PDF generation is pure (no DB calls, no side effects)
