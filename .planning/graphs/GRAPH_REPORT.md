# Graph Report - Lara Croft  (2026-09-16)

## Corpus Check
- 114 files · ~100,924 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 10, .css 1, .toml 1)

## Summary
- 687 nodes · 1158 edges · 49 communities (45 shown, 4 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f2bf7e2a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- normalize
- client/package.json
- LARA CROFT - MERN Stack E-Commerce Design
- Phase 1: Foundation (Week 1)
- server/package.json
- compilerOptions
- src/index.ts
- compilerOptions
- productController.ts
- Task 23: Final Integration Test Report
- dependencies
- devDependencies
- package.json
- emailService.ts
- compilerOptions
- Details
- Task 19: Checkout Page with Razorpay Payment Integration
- Production-1 Report: Frontend Admin Route Protection
- Changes Made
- Task 14 — Google OAuth Sign-In/Sign-Out with Supabase
- .oxlintrc.json
- Global Constraints
- src/seed.ts
- scripts
- db/seed.ts
- Production 2 Report: Image Upload + Admin Product Edit
- Progress Ledger
- Changes
- Task 11 Report: Admin Dashboard
- Task 12 — Seed Script
- Task 13 — Report
- Task 16 — Header, Footer, Layout Components (Light Theme)
- Task 1 Report — Monorepo Scaffold
- Task 21-22 Report: Admin Orders, Account Page, Route Wiring
- Task 2 Report: Shared TypeScript Types
- Task 3: Backend Config Files
- Task 4 Report: Mongoose Models
- Task 9 Report: Order Creation with Razorpay Checkout
- upload.ts
- Task 18: Home Page, Cart Page, and App Router
- Task 6 Report: Auth Routes
- vercel.json
- React + TypeScript + Vite
- Task 17 Report: Product Card, Grid, Detail Page, and Category Page
- client/tsconfig.json
- client/vercel.json
- task-8-report.md

## God Nodes (most connected - your core abstractions)
1. `useUserStore` - 33 edges
2. `normalize()` - 33 edges
3. `findOne()` - 28 edges
4. `react-router-dom` - 22 edges
5. `express` - 21 edges
6. `updateOne()` - 21 edges
7. `react` - 19 edges
8. `compilerOptions` - 18 edges
9. `api` - 16 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- ``client/src/stores/useUserStore.ts`` --references--> `useAuth()`  [INFERRED]
  .superpowers/sdd/task-14-report.md → client/src/hooks/useAuth.ts
- `Dependencies Used` --references--> `useAuth()`  [INFERRED]
  .superpowers/sdd/task-16-report.md → client/src/hooks/useAuth.ts
- `Implementation` --references--> `useAuth()`  [INFERRED]
  .superpowers/sdd/task-18-report.md → client/src/hooks/useAuth.ts
- ``client/src/stores/useCartStore.ts`` --references--> `clearCart()`  [INFERRED]
  .superpowers/sdd/task-14-report.md → server/src/controllers/cartController.ts
- `Changes` --references--> `confirmOrder()`  [INFERRED]
  .superpowers/sdd/production-3-report.md → server/src/controllers/orderController.ts

## Import Cycles
- None detected.

## Communities (49 total, 4 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.06
Nodes (70): App(), AdminLayout(), NAV_ITEMS, PAGE_LABELS, AdminRoute(), ProtectedRoute(), Footer(), Header() (+62 more)

### Community 1 - "normalize"
Cohesion: 0.08
Nodes (60): bcrypt, express, jsonwebtoken, vitest, env, envSchema, razorpay, supabase (+52 more)

### Community 2 - "client/package.json"
Cohesion: 0.05
Nodes (43): dependencies, axios, razorpay, react, react-dom, react-hot-toast, react-router-dom, @supabase/supabase-js (+35 more)

### Community 3 - "LARA CROFT - MERN Stack E-Commerce Design"
Cohesion: 0.05
Nodes (42): 10. Testing Strategy, 11. MVP Scope (2-3 weeks), 12. Future Enhancements (Post-MVP), 1. Architecture Overview, 2. Backend Architecture, 3. Frontend Architecture, 4. Database Schema (MongoDB), 5. Real-time Features (Supabase Realtime) (+34 more)

### Community 4 - "Phase 1: Foundation (Week 1)"
Cohesion: 0.06
Nodes (30): File Structure, Global Constraints, Lara Croft MERN Stack — Implementation Plan, Phase 1: Foundation (Week 1), Phase 2: Frontend (Week 1-2), Phase 3: Checkout & Orders (Week 2), Summary, Task 10: Razorpay Webhook Handler (+22 more)

### Community 5 - "server/package.json"
Cohesion: 0.08
Nodes (24): jose, nodemailer, nodemon, supertest, tsx, @types/bcrypt, @types/cors, @types/express (+16 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 7 - "src/index.ts"
Cohesion: 0.14
Nodes (15): cors, express-rate-limit, helmet, morgan, app, frontendUrl, logger(), apiLimiter (+7 more)

### Community 8 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 9 - "productController.ts"
Cohesion: 0.17
Nodes (14): getCategories(), getFeaturedProducts(), getProductBySlug(), getProducts(), router, 1. Created `server/src/controllers/productController.ts`, 2. Created `server/src/routes/products.ts`, 3. Updated `server/src/index.ts` (+6 more)

### Community 10 - "Task 23: Final Integration Test Report"
Cohesion: 0.12
Nodes (14): UserState, User, Features, Files Created, Notes, Task 20: Admin Dashboard Pages, Client Build — PASS, Critical Issues (+6 more)

### Community 11 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, bcrypt, cors, dotenv, express, express-rate-limit, helmet, jose (+7 more)

### Community 12 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, nodemon, supertest, tsx, @types/bcrypt, @types/cors, @types/express, @types/jsonwebtoken (+7 more)

### Community 13 - "package.json"
Cohesion: 0.14
Nodes (13): devDependencies, concurrently, playwright, name, private, scripts, build, dev (+5 more)

### Community 14 - "emailService.ts"
Cohesion: 0.19
Nodes (11): buildOrderEmailHtml(), formatDate(), formatPrice(), OrderEmailData, sendOrderConfirmation(), Changes, Design Decisions, Environment Variables (+3 more)

### Community 15 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, module, moduleResolution, outDir, resolveJsonModule, rootDir (+4 more)

### Community 16 - "Details"
Cohesion: 0.20
Nodes (9): zod, AppError, errorHandler(), notFound(), validate(), Commit, Details, Status: COMPLETE (+1 more)

### Community 17 - "Task 19: Checkout Page with Razorpay Payment Integration"
Cohesion: 0.17
Nodes (11): `client/src/App.tsx`, `client/src/pages/Checkout.tsx`, `client/src/pages/CheckoutSuccess.tsx`, Commit, Dependencies, Files Created, Files Modified, Notes (+3 more)

### Community 18 - "Production-1 Report: Frontend Admin Route Protection"
Cohesion: 0.18
Nodes (10): 1. Created `client/src/components/auth/AdminRoute.tsx`, 2. Created `client/src/components/auth/ProtectedRoute.tsx`, AdminRoute, Changes Made, Commit, Production-1 Report: Frontend Admin Route Protection, ProtectedRoute, Route Protection Logic (+2 more)

### Community 19 - "Changes Made"
Cohesion: 0.20
Nodes (9): 1. Rate Limiting (`server/src/middleware/rateLimiter.ts`), 2. Security Headers (`server/src/index.ts`), 3. Request Size Limits, 4. Webhook Safety, 5. Additional Improvements, Changes Made, Files Modified, Production Security Hardening Report (+1 more)

### Community 20 - "Task 14 — Google OAuth Sign-In/Sign-Out with Supabase"
Cohesion: 0.22
Nodes (8): Auth Flow, `client/src/hooks/useAuth.ts`, `client/src/stores/useCartStore.ts`, `client/src/stores/useUserStore.ts`, Commit, Files Created, Summary, Task 14 — Google OAuth Sign-In/Sign-Out with Supabase

### Community 21 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 22 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, Saved Addresses Implementation Plan, Task 1: Backend - Add GET and DELETE address routes, Task 2: Frontend - Add Addresses tab to Account page, Task 3: Frontend - Add saved address selection to Checkout

### Community 23 - "src/seed.ts"
Cohesion: 0.33
Nodes (4): dotenv, categories, products, supabase

### Community 24 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, seed, set-admin-password, test

### Community 25 - "db/seed.ts"
Cohesion: 0.33
Nodes (3): categories, db, products

### Community 26 - "Production 2 Report: Image Upload + Admin Product Edit"
Cohesion: 0.33
Nodes (5): Dependencies Installed, Files Created, Files Modified, Notes, Production 2 Report: Image Upload + Admin Product Edit

### Community 27 - "Progress Ledger"
Cohesion: 0.33
Nodes (5): Build Status, Completed Tasks, Current State, Next: Real Supabase/Razorpay credentials needed, Progress Ledger

### Community 28 - "Changes"
Cohesion: 0.33
Nodes (5): Changes, Created, Modified, Task 10: Razorpay Webhook Handler, Verification

### Community 29 - "Task 11 Report: Admin Dashboard"
Cohesion: 0.33
Nodes (5): Files Created, Files Modified, Routes (all require `admin` or `manager` role), Task 11 Report: Admin Dashboard, Verification

### Community 30 - "Task 12 — Seed Script"
Cohesion: 0.33
Nodes (5): Changes, Notes, Product Catalog, Task 12 — Seed Script, Usage

### Community 31 - "Task 13 — Report"
Cohesion: 0.33
Nodes (5): Commit, Files Changed, Summary, Task 13 — Report, Verification

### Community 32 - "Task 16 — Header, Footer, Layout Components (Light Theme)"
Cohesion: 0.33
Nodes (5): Dependencies Used, Files Created, Next, Task 16 — Header, Footer, Layout Components (Light Theme), Theme Applied

### Community 33 - "Task 1 Report — Monorepo Scaffold"
Cohesion: 0.33
Nodes (5): Commits, Concerns, Task 1 Report — Monorepo Scaffold, Verification, What Was Created

### Community 34 - "Task 21-22 Report: Admin Orders, Account Page, Route Wiring"
Cohesion: 0.33
Nodes (5): Commit, Files Created, Files Modified, Notes, Task 21-22 Report: Admin Orders, Account Page, Route Wiring

### Community 35 - "Task 2 Report: Shared TypeScript Types"
Cohesion: 0.33
Nodes (5): Commit, File Created, Interfaces Defined, Status, Task 2 Report: Shared TypeScript Types

### Community 36 - "Task 3: Backend Config Files"
Cohesion: 0.33
Nodes (5): Created Files, Dependencies Used, Env Vars Required, Task 3: Backend Config Files, Updated Files

### Community 37 - "Task 4 Report: Mongoose Models"
Cohesion: 0.33
Nodes (5): Files Created, Indexes, Notes, Relationships, Task 4 Report: Mongoose Models

### Community 38 - "Task 9 Report: Order Creation with Razorpay Checkout"
Cohesion: 0.33
Nodes (5): API Endpoints Summary, Design Decisions, Summary, Task 9 Report: Order Creation with Razorpay Checkout, TypeScript Status

### Community 39 - "upload.ts"
Cohesion: 0.40
Nodes (4): multer, uploadImage(), router, upload

### Community 40 - "Task 18: Home Page, Cart Page, and App Router"
Cohesion: 0.40
Nodes (4): Files Created/Modified, Implementation, Summary, Task 18: Home Page, Cart Page, and App Router

### Community 41 - "Task 6 Report: Auth Routes"
Cohesion: 0.40
Nodes (4): Endpoints, Files Created, Files Modified, Task 6 Report: Auth Routes

### Community 42 - "vercel.json"
Cohesion: 0.40
Nodes (4): buildCommand, installCommand, outputDirectory, rewrites

### Community 43 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 44 - "Task 17 Report: Product Card, Grid, Detail Page, and Category Page"
Cohesion: 0.50
Nodes (3): Features, Files Created, Task 17 Report: Product Card, Grid, Detail Page, and Category Page

## Knowledge Gaps
- **354 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+349 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 391 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `findOne()` connect `normalize` to `productController.ts`, `Task 23: Final Integration Test Report`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **Why does `Fixes Applied` connect `Task 23: Final Integration Test Report` to `normalize`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **Why does `User` connect `Task 23: Final Integration Test Report` to `App.tsx`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `findOne()` (e.g. with `auth.test.ts` and `order.test.ts`) actually correct?**
  _`findOne()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _354 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.059394631639063396 - nodes in this community are weakly interconnected._
- **Should `normalize` be split into smaller, more focused modules?**
  _Cohesion score 0.0823293172690763 - nodes in this community are weakly interconnected._