# Saved Addresses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add saved addresses feature - users can save multiple addresses and select them at checkout.

**Architecture:** Extend existing auth controller with GET/DELETE address routes. Add addresses tab to Account page. Add saved address selection to Checkout page.

**Tech Stack:** Express, Supabase, React, Zustand, react-hot-toast, Tailwind CSS

## Global Constraints
- No comments in code
- Keep existing code style (dark theme, brand-accent colors, text-[13px])
- Use existing api service for frontend calls
- Addresses stored on user document in Supabase
- Maximum 5 addresses per user
- Use toast for success/error messages

---

### Task 1: Backend - Add GET and DELETE address routes

**Files:**
- Modify: `server/src/controllers/authController.ts`
- Modify: `server/src/routes/auth.ts`

**Interfaces:**
- Consumes: AuthRequest middleware, findOne/updateOne from supabase-db
- Produces: getAddresses, deleteAddress controller functions; GET/DELETE routes

- [ ] **Step 1: Add getAddresses and deleteAddress to authController.ts**

```typescript
export async function getAddresses(req: AuthRequest, res: Response): Promise<void> {
  try {
    res.json({ success: true, data: req.user.addresses || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const index = parseInt(req.params.index, 10);
    const addresses = [...(req.user.addresses || [])];
    if (index < 0 || index >= addresses.length) {
      res.status(400).json({ success: false, error: 'Invalid address index' });
      return;
    }
    addresses.splice(index, 1);
    const user = await updateOne('users', req.userId!, { addresses });
    res.json({ success: true, data: normalize(user) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

- [ ] **Step 2: Add max 5 validation to addAddress**

```typescript
export async function addAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { label, line1, line2, city, state, postalCode, country, phone } = req.body;
    const addresses = [...(req.user.addresses || [])];
    if (addresses.length >= 5) {
      res.status(400).json({ success: false, error: 'Maximum 5 addresses allowed' });
      return;
    }
    addresses.push({
      label,
      line1,
      line2,
      city,
      state,
      postalCode,
      country: country || 'IN',
      phone,
    });
    const user = await updateOne('users', req.userId!, { addresses });
    res.json({ success: true, data: normalize(user) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

- [ ] **Step 3: Add routes to auth.ts**

```typescript
import { syncUser, getProfile, updateProfile, addAddress, getAddresses, deleteAddress } from '../controllers/authController';

router.get('/addresses', authenticate, getAddresses);
router.delete('/addresses/:index', authenticate, deleteAddress);
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd server && npx tsc --noEmit`
Expected: No errors

---

### Task 2: Frontend - Add Addresses tab to Account page

**Files:**
- Modify: `client/src/pages/Account.tsx`

**Interfaces:**
- Consumes: api service, useUserStore, Address type
- Produces: addresses tab UI with list, add form, delete functionality

- [ ] **Step 1: Add addresses state and tab**

Update Account.tsx to include:
- `addresses` state and `addressForm` state
- `showForm` state for toggling add form
- `addresses` tab button
- Address list with delete buttons
- Add new address form with same fields as checkout

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors

---

### Task 3: Frontend - Add saved address selection to Checkout

**Files:**
- Modify: `client/src/pages/Checkout.tsx`

**Interfaces:**
- Consumes: api service, useUserStore, Address type
- Produces: saved address cards, selection logic, save checkbox

- [ ] **Step 1: Add saved address selection UI**

Update Checkout.tsx to include:
- Fetch user addresses on mount
- Display saved address cards if user has addresses
- Click to auto-fill form
- "Use new address" option
- "Save this address" checkbox

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd client && npx tsc --noEmit`
Expected: No errors
