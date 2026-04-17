# Laundry System Implementation Roadmap

This document tracks the upgrade path from the current single-shop system to a secure, scalable multi-shop platform.

## 1) Objectives

- Improve current operations for a single laundry shop.
- Prepare architecture for multi-shop support without data leaks.
- Roll out changes in low-risk phases with clear acceptance criteria.

## 2) Current State (Baseline)

- Frontend modules: dashboard, new order, order management, customers, receipts.
- Backend: Supabase Edge Function using key-value storage.
- No authentication or role-based permissions.
- Data is global (single-tenant) and not segmented by shop.

## 3) Product Upgrades (Single Shop)

These features provide immediate value and should be completed while preparing for multi-shop.

### 3.1 Priority A (Core Operations)

- [ ] Authentication and role-based access (Owner, Cashier, Staff)
- [ ] Audit trail for order and payment changes
- [ ] Pickup management (pickup target date/time, overdue flags, release confirmation)
- [ ] Configurable pricing engine (service pricing, rush fees, discounts)
- [ ] End-of-day cash reconciliation report

### 3.2 Priority B (Operational Intelligence)

- [ ] Customer notifications (SMS/Viber when ready for pickup)
- [ ] Inventory tracking (detergent, softener, packaging)
- [ ] Expense tracking and profit reporting
- [ ] Export reports (CSV/PDF)
- [ ] Queue board for work stages (Pending, Washing, Drying, Ready, Completed)

## 4) Multi-Shop Strategy

## Decision

Build this as a multi-tenant app with strict tenant isolation per shop.

## Why

- Supports multiple branches under one business.
- Enables centralized reporting for operators.
- Opens SaaS or subscription business potential.

## Risks to Manage

- Data leakage across shops if isolation is incomplete.
- Permission complexity (owner vs manager vs staff).
- Migration risk while existing users are active.

## 5) Target Data Model

Introduce the following entities:

- `organizations` - business account/container
- `shops` - branch location/unit
- `users` - authenticated accounts
- `memberships` - relationship of users to organization/shop with role

Add `shopId` to domain records:

- `orders`
- `customers`
- `payments`
- `expenses`
- `inventory_transactions`

Optional but recommended:

- `service_catalog` (per-shop service definitions and prices)
- `notification_logs`
- `audit_logs`

## 6) Security and Isolation Rules

- Every request resolves user identity from auth token.
- Every query is constrained by `shopId`.
- UI only displays data scoped to active shop.
- Enforce isolation at data layer (RLS if moving to relational tables).
- No write/read endpoint should execute without tenant context.

## 7) Migration Plan (Phased, Low Risk)

### Phase 1 - Auth and RBAC Foundation

Deliverables:

- [ ] Login/logout session flow
- [ ] Role model: Owner, Manager, Cashier, Staff
- [ ] Route and action guards (frontend + backend)

Exit criteria:

- Only authenticated users can access app data.
- Restricted actions (delete orders, pricing edits) follow role rules.

### Phase 2 - Tenant-Aware Data Model

Deliverables:

- [ ] Add `shopId` to core entities
- [ ] Create default shop for existing data
- [ ] Backfill existing records with default `shopId`

Exit criteria:

- All production records include `shopId`.
- Existing workflows continue to work with default shop.

### Phase 3 - Tenant-Aware API Layer

Deliverables:

- [ ] Update all API endpoints to require tenant context
- [ ] Add tenant scoping in all read/write handlers
- [ ] Add validation tests for cross-shop access blocking

Exit criteria:

- Cross-shop data access is rejected.
- All list/detail endpoints return only tenant-scoped data.

### Phase 4 - Multi-Shop UX

Deliverables:

- [ ] Shop selector/switcher in app layout
- [ ] Shop-scoped dashboard, orders, customers, receipts
- [ ] Persist last selected shop per user

Exit criteria:

- User can switch shops and only see selected shop data.
- Navigation and metrics update correctly on shop change.

### Phase 5 - Organization-Level Reporting

Deliverables:

- [ ] Aggregate metrics across shops
- [ ] Per-shop comparison views
- [ ] Export consolidated reports

Exit criteria:

- Org owner can view per-shop and all-shop summaries.

### Phase 6 - Billing and Onboarding (If SaaS)

Deliverables:

- [ ] Self-serve tenant onboarding
- [ ] Subscription plan + payment integration
- [ ] Trial/limits enforcement

Exit criteria:

- New organizations can onboard and activate without manual setup.

## 8) Implementation Order (Recommended)

1. Auth + role guards
2. Schema updates with `shopId`
3. API tenant scoping
4. Frontend shop switcher
5. Reporting and exports
6. Notifications, inventory, and advanced ops

## 9) Technical Notes for This Codebase

- Current backend uses key-value records; this is fine for MVP but harder for robust tenant enforcement.
- Consider moving core data (`orders`, `customers`, `payments`, `memberships`) into relational tables soon.
- Keep edge function routes but back them with relational queries and tenant-scoped policies.

## 10) Definition of Done for Multi-Shop Readiness

- [ ] All domain records include `shopId`
- [ ] Tenant context required in all API requests
- [ ] Role-based auth enforced for sensitive actions
- [ ] No cross-shop data visibility in UI or API
- [ ] Migration/backfill script documented and repeatable
- [ ] Smoke tests for create/update/read/delete per shop

## 11) Tracking Board

Status legend:

- `todo` - not started
- `doing` - currently in progress
- `done` - completed
- `blocked` - waiting on dependency/decision

### Active Work Items

- [doing] Phase 1 - Auth provider and session plumbing
- [doing] Phase 1 - Role definitions and permission matrix
- [doing] Phase 2 - `shopId` schema update and data backfill script
- [doing] Phase 3 - Tenant-safe API refactor
- [doing] Owner-only staff account control (1 admin + 1 staff per shop)
- [todo] Phase 4 - Shop switcher UI in layout
- [todo] Phase 5 - Cross-shop reporting model
- [doing] Tech Stack Migration - KV to PostgreSQL repository abstraction

