# Backend delivery plan

This list is ordered. Finish the current milestone before expanding the next one.
Deferred infrastructure stays out of the critical path until the core workflow is
usable.

## Recently completed

- [x] Reviewed the current Express/MVC project structure.
- [x] Documented the real route layout.
- [x] Documented the real controller layout.
- [x] Documented the real service layout.
- [x] Documented the real model layout.
- [x] Documented the real auth layout.
- [x] Documented the real Prisma layout.
- [x] Updated `README.md` with the current API status.
- [x] Updated `README.md` with implemented endpoints.
- [x] Updated `README.md` with missing production hardening.
- [x] Updated `README.md` with known authorization risk.
- [x] Updated `docs/architecture.md` with the current MVC-oriented structure.
- [x] Updated `docs/architecture.md` with route-versioning direction.
- [x] Updated `docs/architecture.md` with auth boundaries.
- [x] Updated `docs/architecture.md` with validation/error-handling
      conventions.
- [x] Updated this delivery plan with the next safe implementation slice.
- [x] Verified the project after the docs update with Prisma validation.
- [x] Verified the project after the docs update with build.
- [x] Verified the project after the docs update with whitespace checks.
- [x] Moved implemented business routes under `/api/v1`.
- [x] Moved self-service password changes to
      `PATCH /api/v1/users/:id/password`.
- [x] Added self-ownership authorization middleware.
- [x] Added active-profile authorization middleware.
- [x] Protected user listing with the `ADMIN` profile.
- [x] Added an admin password-change route guarded by profile authorization.
- [x] Added database-aware `GET /is-ready`.

## Priorities

1. Validation and request contracts.
2. Centralized error handling.
3. Authentication/session hardening.
4. Operational hardening.
5. Next business domain slice.

## 0. Foundation

- [x] Create the initial Prisma schema.
- [x] Create the initial migration.
- [x] Create an idempotent seed for profiles.
- [x] Create an idempotent seed for sample CRM data.
- [x] Centralize environment variables.
- [x] Validate environment variables.
- [x] Add basic bcrypt helpers.
- [x] Add JWT access-token helpers.
- [x] Add a minimal Express server.
- [x] Establish the initial MVC directories.
- [x] Split routing concerns out of the app entrypoint.
- [x] Split controller concerns out of route files.
- [x] Separate Express application creation from HTTP server startup.
- [x] Move the shared Prisma Client into `database/prisma-client.ts`.
- [x] Align Prisma Client imports with the configured generated client.
- [x] Add `tsconfig.json`.
- [x] Make `npm run build` succeed.
- [x] Define a production artifact.
- [x] Copy the generated Prisma query engine into `dist` during build.
- [x] Commit to Express.
- [x] Remove unused Fastify dependencies.
- [x] Commit to Zod request schemas.
- [x] Remove `express-validator`.
- [x] Remove the deprecated `package.json#prisma` configuration.
- [x] Add `GET /is-up`.
- [x] Add database-aware `GET /is-ready`.
- [x] Move implemented auth routes from `/api/auth` to `/api/v1/auth`.
- [x] Move implemented user routes from `/api/users` to `/api/v1/users`.

## 1. Validation and API responses - current priority

- [x] Add a reusable Zod validation middleware.
- [x] Add Zod validation for login payloads.
- [x] Normalize login email before querying.
- [x] Add Zod validation for UUID route params.
- [x] Add Zod validation for password-change payloads.
- [ ] Add a not-found middleware.
- [ ] Add a centralized API error middleware.
- [x] Normalize validation error responses.
- [ ] Normalize authentication error responses.
- [ ] Normalize authorization error responses.
- [ ] Normalize unexpected error responses.

## 2. Authentication and users

- [x] Implement initial login by email.
- [x] Issue a short-lived access token.
- [x] Implement initial Bearer access-token authentication.
- [x] Implement an initial bounded user list.
- [x] Implement an initial password-change use case.
- [x] Move password changes to `PATCH /api/v1/users/:id/password`.
- [x] Prevent authenticated users from changing other users' passwords through
      the self-service endpoint.
- [x] Enforce self-service ownership for password changes.
- [x] Add active-profile authorization middleware.
- [x] Decide that user listing is admin-only for the current implementation.
- [x] Protect user listing with the `ADMIN` profile.
- [x] Add an admin-only password-change route for changing another user's
      password.
- [ ] Add `User.isActive`.
- [ ] Block disabled users during login.
- [ ] Add a `RefreshSession` model.
- [ ] Hash refresh-session tokens.
- [ ] Rotate refresh sessions.
- [ ] Detect refresh-session reuse.
- [ ] Revoke refresh sessions on logout.
- [ ] Implement `POST /api/v1/auth/refresh`.
- [ ] Implement `POST /api/v1/auth/logout`.
- [ ] Implement `GET /api/v1/auth/me`.
- [ ] Ensure `/auth/me` never exposes sensitive user fields.
- [ ] Support the final email-or-username login policy.
- [ ] Implement forgot-password requests with generic responses.
- [ ] Store only hashed password-reset tokens.
- [ ] Add password-reset token expiry.
- [ ] Enforce single-use password-reset tokens.
- [ ] Revoke user sessions after password reset.
- [ ] Add rate limits to login.
- [ ] Add rate limits to refresh.
- [ ] Add rate limits to password-reset endpoints.
- [ ] Implement remaining user CRUD.
- [ ] Implement user activation/deactivation.
- [ ] Implement auditable profile assignment.
- [ ] Implement auditable profile revocation.

## 3. Operational hardening

- [ ] Add graceful HTTP shutdown.
- [ ] Disconnect Prisma on process termination.
- [ ] Add configured CORS.
- [ ] Add Helmet.
- [ ] Add request IDs.
- [ ] Add structured logging.
- [ ] Add format script suitable for CI.
- [ ] Add lint script suitable for CI.
- [ ] Add type-check script suitable for CI.
- [ ] Add test script suitable for CI.
- [ ] Remove currently unused runtime dependencies.
- [ ] Justify any intentionally retained unused runtime dependencies.
- [ ] Remove unused development tooling.
- [ ] Justify any intentionally retained unused development tooling.

## 4. Customer and catalog baseline

- [ ] Implement account listing.
- [ ] Implement account creation.
- [ ] Implement account update.
- [ ] Implement contact listing.
- [ ] Implement contact creation.
- [ ] Implement contact update.
- [ ] Implement address listing.
- [ ] Implement address creation.
- [ ] Implement address update.
- [ ] Add pagination to account queries.
- [ ] Add pagination to contact queries.
- [ ] Add pagination to address queries.
- [ ] Prevent cyclic account hierarchies.
- [ ] Implement product listing.
- [ ] Implement product creation.
- [ ] Implement product update.
- [ ] Implement catalog listing.
- [ ] Implement catalog creation.
- [ ] Implement catalog update.
- [ ] Implement catalog item listing.
- [ ] Implement catalog item creation.
- [ ] Implement catalog item update.
- [ ] Define archival behavior for referenced master data.
- [ ] Define soft-delete behavior for referenced master data.
- [ ] Validate monetary values.
- [ ] Validate quantities.
- [ ] Validate government IDs.
- [ ] Validate currency codes.
- [ ] Validate product codes.
- [ ] Add authorization rules for `ADMIN`.
- [ ] Add authorization rules for `SALES`.
- [ ] Add authorization rules for `FINANCE`.
- [ ] Add authorization rules for `MANAGER`.
- [ ] Add authorization rules for `LOGISTICS`.

## 5. Quotes and orders

- [ ] Implement quote line creation.
- [ ] Implement quote line update.
- [ ] Implement server-side quote total calculation.
- [ ] Implement direct order creation.
- [ ] Implement order creation from an immutable quote snapshot.
- [ ] Decide tax rules.
- [ ] Decide freight rules.
- [ ] Decide rounding rules.
- [ ] Decide editing rules.
- [ ] Decide cancellation rules.
- [ ] Separate operational order status transitions from approval status.
- [ ] Review the address model for historical order snapshots.
- [ ] Add transaction tests for monetary calculations.
- [ ] Add integration tests for monetary calculations.

## 6. Approval workflow

- [ ] Select exactly one active approval policy by currency.
- [ ] Match approval policies with inclusive value ranges.
- [ ] Reject overlapping approval-policy configurations.
- [ ] Submit an order atomically.
- [ ] Create approval steps atomically.
- [ ] Allow decisions only on the current approval step.
- [ ] Allow decisions only from an allowed active profile.
- [ ] Prohibit requester self-approval.
- [ ] Prohibit duplicate decisions.
- [ ] Approve after the required distinct approvals.
- [ ] Reject on the first rejection.
- [ ] Resolve the order atomically.
- [ ] Cancel later approval steps atomically.
- [ ] Expose pending approval work.
- [ ] Expose approval decision submission.
- [ ] Expose approval cancellation.
- [ ] Expose approval history.
- [ ] Test simultaneous decisions.
- [ ] Test rollback behavior.
- [ ] Test profile revocation during approval.
- [ ] Test complete approval paths.
- [ ] Test complete rejection paths.

## 7. Inventory and operations

- [ ] Implement branch listing.
- [ ] Implement branch creation.
- [ ] Implement branch update.
- [ ] Implement storage listing.
- [ ] Implement storage creation.
- [ ] Implement storage update.
- [ ] Implement inventory queries.
- [ ] Decide when an order reserves stock.
- [ ] Enforce non-negative available balances.
- [ ] Enforce non-negative committed balances.
- [ ] Enforce `total = available + committed` transactionally.
- [ ] Add immutable inventory-movement records.
- [ ] Implement bill-of-material validation.
- [ ] Prevent direct bill-of-material self-reference.
- [ ] Add operational metrics.
- [ ] Define backup policy.
- [ ] Define retention policy.
- [ ] Define cleanup policy.
- [ ] Define audit-log policy.

## Tests

- [ ] Add tests for login.
- [ ] Add tests for invalid credentials.
- [ ] Add tests for invalid tokens.
- [ ] Add tests for expired tokens.
- [ ] Add tests for user-list access.
- [ ] Add tests for password-change ownership.
- [ ] Add tests for profile-based authorization.
- [ ] Add tests for revoked sessions.
- [ ] Add tests for disabled users.
- [ ] Add tests for revoked profiles.

## Product decisions required

- [ ] Decide whether an account can have multiple owners.
- [ ] Decide whether discount can be monetary.
- [ ] Decide whether discount can be percentage-based.
- [ ] Decide whether monetary and percentage discounts can coexist.
- [ ] Decide whether inventory is reserved before or after order approval.
- [ ] Decide which order states permit editing.
- [ ] Decide which order states permit cancellation.
- [ ] Decide which order states permit resubmission.
- [ ] Decide session retention periods.
- [ ] Decide reset-token retention periods.
- [ ] Decide audit-data retention periods.

## Deferred until justified

- Redis caching.
- Distributed rate limiting.
- Email notifications beyond password reset.
- Background jobs.
- Queues.
- Service decomposition.
- Microservices.
- Advanced permission records beyond the current profile model.
