# Task 10: Razorpay Webhook Handler

**Status:** Complete
**Commit:** `7bd6d85`

## Changes

### Created
- `server/src/routes/webhooks.ts` — Webhook endpoint at `POST /api/webhooks/razorpay`
  - Signature verification via HMAC-SHA256 with `RAZORPAY_WEBHOOK_SECRET`
  - Handles `payment.captured`, `payment.failed`, `refund.created`
  - Updates order status and payment status accordingly
  - Uses `express.raw()` middleware on the route for raw body access

### Modified
- `server/src/index.ts`
  - Imported `webhookRoutes`
  - Mounted `/api/webhooks` BEFORE `express.json()` middleware (critical — webhook needs raw body for signature verification)

## Verification
- TypeScript compilation: no new errors introduced
- Route ordering: webhook mounted before JSON body parser ✓
- Signature verification: HMAC-SHA256 against raw body ✓
