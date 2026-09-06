# Production Report — Email Service

**Commit:** `ee28bed` — `feat: add email service for order confirmations`

## Summary

Added Nodemailer-based email service for order confirmations. Emails fire asynchronously after payment verification.

## Changes

| File | Action |
|------|--------|
| `server/package.json` | Added `nodemailer`, `@types/nodemailer` |
| `server/src/services/emailService.ts` | **Created** — transporter, HTML builder, send function |
| `server/src/config/env.ts` | Added `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (optional) |
| `server/src/controllers/orderController.ts` | Added email send after `order.save()` in `confirmOrder` |
| `server/.env` | Added placeholder SMTP vars |

## Design Decisions

- **Fire-and-forget**: `sendOrderConfirmation()` not awaited — won't delay payment response
- **Graceful skip**: When SMTP vars missing, logs and returns silently
- **Brand template**: Uses #6f4423 (brown) + #f7f2ec (cream) palette, "PRIMA FACIE — LARA CROFT" header
- **Price format**: INR with paise-to-rupee conversion (`paise / 100`)

## Environment Variables

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Verification

- `npx tsc --noEmit` — passed (0 errors)
- Email sends only when `SMTP_USER` and `SMTP_PASS` are set
