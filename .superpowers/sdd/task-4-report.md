# Task 4 Report: Mongoose Models

**Status:** Complete  
**Date:** 2026-09-06

## Files Created

| Model | File | Key Features |
|-------|------|-------------|
| Category | `server/src/models/Category.ts` | slug, order, active flag, compound index |
| Product | `server/src/models/Product.ts` | category ref, stockBySize map, text search index |
| User | `server/src/models/User.ts` | supabaseId, role enum, embedded addresses |
| Order | `server/src/models/Order.ts` | status/payment enums, Razorpay fields, embedded addresses |
| Cart | `server/src/models/Cart.ts` | unique per user, size-variant items |

## Indexes

- **Category:** slug, (active + order)
- **Product:** slug, category, featured, text search (name + description)
- **User:** supabaseId, email
- **Order:** user, status, paymentStatus, razorpayOrderId
- **Cart:** user

## Relationships

```
Category 1──∞ Product
User 1──∞ Order
User 1──1 Cart
Product 1──∞ Order.items
Product 1──∞ Cart.items
```

## Notes

- All models use `{ timestamps: true }` for createdAt/updatedAt
- User links to Supabase via `supabaseId` (not password auth)
- Cart is unique per user (one active cart)
- Order stores denormalized item data (name, price, image) for historical accuracy
- Currency defaults to INR (Indian Rupees)
- Address schemas shared between User, Order (shipping + billing)
