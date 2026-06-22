# Backend delivery plan

This list is ordered. Finish the current milestone before expanding the next one.
Deferred infrastructure stays out of the critical path until the core workflow is
usable.

## 0. Foundation — current priority

- [x] Create the initial Prisma schema and migration.
- [x] Create an idempotent seed for profiles and sample CRM data.
- [x] Centralize and validate environment variables.
- [x] Add basic bcrypt and JWT helpers.
- [x] Add a minimal Express server.
- [x] Establish the initial MVC directories and split routing/controller concerns.
- [x] Separate Express application creation from HTTP server startup.
- [x] Move the shared Prisma Client into `database/prisma-client.ts` and align it
      with the configured generated client.
- [x] Add `tsconfig.json`.
- [x] Make `npm run build` succeed.
- [x] Define a production artifact and copy the generated Prisma query engine into
      `dist` during the build.
- [x] Commit to Express and remove unused Fastify dependencies.
- [x] Commit to Zod request schemas and remove `express-validator`.
- [x] Remove the deprecated `package.json#prisma` configuration after confirming
      the equivalent settings in `prisma.config.ts`.
- [ ] Add graceful HTTP shutdown and disconnect Prisma on process termination.
- [ ] Add configured CORS, Helmet, request IDs, structured logging, and a global
      error handler.
- [ ] Add `GET /health` and database-aware `GET /ready`.
- [ ] Add format, lint, type-check, and test scripts suitable for CI.

## 1. Authentication and users

- [ ] Add `User.isActive` and a hashed/rotating `RefreshSession` model with a
      migration.
- [ ] Implement login by normalized email or username.
- [ ] Implement access-token authentication and active-profile authorization.
- [ ] Implement refresh rotation, logout, session revocation, and reuse detection.
- [ ] Implement `GET /auth/me` without exposing sensitive user fields.
- [ ] Implement forgot/reset password with generic responses, hashed tokens,
      expiry, single use, and session revocation.
- [ ] Add rate limits to login, refresh, and password-reset endpoints.
- [ ] Implement user CRUD, activation, and auditable profile assignment/revocation.
- [ ] Test invalid credentials, expired tokens, revoked sessions, disabled users,
      and revoked profiles.

## 2. Customer and catalog baseline

- [ ] Implement accounts, contacts, and addresses with normalization and
      pagination.
- [ ] Prevent cyclic account hierarchies.
- [ ] Implement products, catalogs, and catalog items.
- [ ] Define archival/soft-delete behavior for referenced master data.
- [ ] Validate monetary values, quantities, government IDs, currency codes, and
      product codes.
- [ ] Add authorization rules for `ADMIN`, `SALES`, `FINANCE`, `MANAGER`, and
      `LOGISTICS`.

## 3. Quotes and orders

- [ ] Implement quote lines and server-side total calculation.
- [ ] Implement order creation directly and from an immutable quote snapshot.
- [ ] Decide tax, freight, rounding, and editing/cancellation rules.
- [ ] Separate operational order status transitions from approval status.
- [ ] Review the address model so historical orders retain address snapshots.
- [ ] Add transaction and integration tests for monetary calculations.

## 4. Approval workflow

- [ ] Select exactly one active policy by currency and inclusive value range;
      reject overlapping configurations.
- [ ] Submit an order and create its approval steps atomically.
- [ ] Allow decisions only on the current step and from an allowed active profile.
- [ ] Prohibit requester self-approval and duplicate decisions.
- [ ] Approve after the required distinct approvals; reject on the first rejection.
- [ ] Resolve the order and cancel later steps atomically.
- [ ] Expose pending work, decision, cancellation, and history endpoints.
- [ ] Test simultaneous decisions, rollback, profile revocation, and complete
      approval/rejection paths.

## 5. Inventory and operations

- [ ] Implement branches, storages, and inventory queries.
- [ ] Decide when an order reserves stock.
- [ ] Enforce non-negative balances and
      `total = available + committed` transactionally.
- [ ] Add immutable inventory-movement records before enabling stock mutations.
- [ ] Implement bill-of-material validation and prevent direct self-reference.
- [ ] Add OpenAPI documentation and operational metrics.
- [ ] Define backup, retention, cleanup, and audit-log policies.

## Deferred until justified

- Redis caching and distributed rate limiting.
- Email notifications beyond password reset.
- Background jobs and queues.
- Service decomposition or microservices.
- Advanced permission records beyond the current profile model.

## Product decisions required

- [ ] Can an account have multiple owners?
- [ ] Is discount monetary, percentage-based, or both? The current baseline treats
      it as a monetary line discount.
- [ ] Is inventory reserved before or after order approval?
- [ ] Which order states permit editing, cancellation, and resubmission?
- [ ] What are the retention periods for sessions, reset tokens, and audit data?
