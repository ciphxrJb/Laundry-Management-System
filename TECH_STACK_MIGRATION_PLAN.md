# Tech Stack Migration Plan

This plan upgrades the current MVP stack into a secure, scalable platform for multi-shop operations.

## Target Stack

- Frontend: React + TypeScript + Vite (keep)
- Auth: Supabase Auth (keep)
- Data: Supabase PostgreSQL tables + RLS (migrate from KV)
- API: Supabase Edge Functions with domain-oriented repository layer
- Validation: Zod (next phase)
- Data fetching/cache: TanStack Query (next phase)
- Testing: Vitest + Testing Library + Playwright (next phase)
- Monitoring: Sentry + Supabase logs (next phase)

## Why Migrate

- KV storage is simple but not ideal for multi-tenant consistency and secure scoping.
- PostgreSQL enables joins, constraints, indexing, and safer reporting at scale.
- Repository abstraction lets us evolve storage without rewriting all route handlers.

## Migration Phases

### Phase A - Foundation (In Progress)

- [x] Add auth-aware backend guards
- [x] Introduce backend repository layer (`repositories.tsx`)
- [x] Add PostgreSQL domain migrations (`laundry_orders`, `laundry_customers`)
- [x] Keep KV fallback to avoid downtime while DB is being prepared

### Phase B - Data Validation and Contracts

- [ ] Add Zod schemas for request/response contracts
- [ ] Enforce consistent error formats from API
- [ ] Add safe parsing and clear validation messages

### Phase C - Frontend Data Layer Modernization

- [ ] Add TanStack Query provider
- [ ] Refactor order/customer/dashboard API hooks to query cache
- [ ] Add optimistic updates for status/payment changes

### Phase D - Tenant Enforcement Hardening

- [ ] Add `shopId` requirement to all domain writes
- [ ] Enforce membership-based RLS policies
- [ ] Add shop-aware API filters and tests

### Phase E - Quality and Delivery

- [ ] Add unit tests for repository and auth guards
- [ ] Add integration tests for order lifecycle
- [ ] Add e2e tests for login + order + customer history
- [ ] Add CI checks for build/test/lint

## Immediate Next Actions

1. Apply new SQL migrations in Supabase project.
2. Backfill existing KV records into relational tables.
3. Enable strict shop-scoped RLS policies.
4. Remove KV fallback when parity is confirmed.

## Exit Criteria for Storage Migration

- All orders and customers are served from PostgreSQL.
- No route reads from KV during normal operation.
- Authenticated users only see authorized records.
- Dashboard and customer history match legacy behavior.
