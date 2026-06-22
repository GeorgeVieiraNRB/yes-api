# Domain and business rules

This document defines the baseline behavior of YES CRM. Rules marked
**application** must be enforced by services/use cases, usually inside a database
transaction. Rules marked **database** already have a corresponding Prisma
constraint. A schema gap is called out when a migration is still required.

## Domain map

| Area | Main models | Responsibility |
| --- | --- | --- |
| Identity | `User`, `Profile`, `UserProfile` | Authentication and access profiles |
| Customers | `Account`, `Contact`, `Address` | Companies, people, ownership, and addresses |
| Catalog | `Product`, `PriceCatalog`, `PriceCatalogProduct` | Products and commercial prices |
| Sales | `Quote`, `QuoteProduct`, `Order`, `PaymentCondition`, `Status` | Quoting and order lifecycle |
| Approval | `ApprovalPolicy`, `ApprovalStep`, `OrderApproval`, `ApprovalDecision` | Ordered, auditable approval workflow |
| Logistics | `Branch`, `Storage`, `StorageProduct` | Branches, warehouses, and inventory balances |
| Manufacturing | `Structure`, `StructureProduct` | Bill of materials for a finished product |

## Identity and access

1. Email, username, and government ID identify one user and are unique
   (**database**).
2. Passwords are never stored or logged in plain text. bcrypt uses the validated
   `PASSWORD_SALT_ROUNDS` value (**application**).
3. An access token is short lived and identifies the user by `id` and `email`.
   Authorization must not trust roles supplied by a client (**application**).
4. Only active `UserProfile` assignments grant access. Revoking a profile sets
   `isActive = false` and `revokedAt`; it does not delete the audit record
   (**application**).
5. Login must be blocked for disabled users. The current schema has no
   `User.isActive` field, so this rule requires a migration (**schema gap**).
6. Refresh tokens must be random, stored only as hashes, rotated after use, and
   revoked on logout or password change. A `RefreshSession` model is still
   required (**schema gap**).
7. Password-reset responses must not reveal whether an email exists. Store only
   a hash of the reset token and invalidate it after use (**application**).

## Customers

1. Each account has one owner and a unique government ID (**database**).
2. A sub-account may have at most one direct parent. Account hierarchies must not
   contain cycles (**application**).
3. Contacts belong to exactly one account and may reference multiple addresses.
4. Customer data is normalized before persistence: email lowercase, government
   IDs and postal codes without presentation characters, and trimmed names
   (**application**).
5. Records referenced by orders or audit history are deactivated or archived,
   not physically deleted. The schema still needs a consistent archival strategy
   (**schema gap**).

## Catalog, quotes, and orders

1. A product code is unique. Prices and quantities must be non-negative
   (**database** for uniqueness; **application** for numeric limits).
2. A catalog item belongs to one product and one catalog; the pair is unique
   (**database**). The catalog currency applies to all of its prices
   (**application**).
3. Quote and order totals are calculated on the server. Clients may propose
   values but cannot define authoritative totals (**application**).
4. For a quote line, `finalPrice = quantity * price - discount`. In this baseline,
   `discount` is a monetary amount for the whole line, not a percentage
   (**application**).
5. An order created from a quote copies commercial values. Later quote changes do
   not mutate the order (**application**).
6. Operational `Status` and `approvalStatus` are separate concerns. An order may
   advance to fulfillment only after required approval is complete
   (**application**).
7. Shipping and payment addresses are snapshots from the order's perspective.
   Editing a customer address must not silently change a historical order. The
   current shared-address model needs review before production (**schema gap**).

## Order approval

1. Submission selects one active policy matching currency and the inclusive
   `minOrderValue`/`maxOrderValue` range. Overlapping matches are a configuration
   error and block submission (**application**).
2. If no policy matches, the order receives `NOT_REQUIRED`. Otherwise it becomes
   `PENDING`, records requester and submission time, and creates one
   `OrderApproval` per policy step in a single transaction (**application**).
3. Steps are processed by ascending `sequence`. Only the first unresolved step
   may receive decisions (**application**).
4. An approver must have an active profile allowed by `ApprovalStepProfile`. The
   profile used is recorded on the decision (**application**).
5. A user can decide only once per order step (**database**). The requester may
   not approve their own order (**baseline decision**).
6. A step becomes approved after `requiredApprovals` distinct valid approvals.
   One rejection rejects the whole flow, resolves the order as `REJECTED`, and
   cancels later pending steps (**application**).
7. Approval of the final step resolves the order as `APPROVED`. Every transition
   updates the corresponding resolution timestamp (**application**).
8. Decisions are immutable audit records. Corrective action starts a new approval
   submission rather than editing historical decisions (**application**).
9. Submission and decisions use database transactions and concurrency control so
   simultaneous requests cannot double-approve or skip a step (**application**).

## Inventory and bill of materials

1. A storage code is unique and a storage belongs to one branch (**database**).
2. For every inventory row,
   `totalQuantity = availableQuantity + committedQuantity`; no quantity may be
   negative (**application**).
3. Reserving stock atomically moves quantity from available to committed.
   Releasing does the reverse; fulfillment reduces committed and total
   (**application**).
4. A bill of materials belongs to one finished product. Component quantities are
   positive and a product cannot directly contain itself (**application**).

## Cross-cutting rules

- Use UTC timestamps in persistence and ISO 8601 in API responses.
- Use database transactions for multi-record state transitions.
- Never expose password hashes, reset tokens, or internal stack traces.
- List endpoints use pagination with a bounded page size and deterministic sort.
- Critical events are auditable: login failures, profile changes, password
  changes, order submissions, approval decisions, and inventory movements.
- API errors follow one shape: `code`, `message`, optional `details`, and
  `requestId`.

## Decisions still needed

- Whether one account can have multiple owners or sales representatives.
- Tax, freight, rounding, and percentage-discount rules.
- Whether inventory is reserved at order creation or only after approval.
- Which order states permit editing, cancellation, or resubmission.
- Retention periods for sessions, reset tokens, and audit records.
