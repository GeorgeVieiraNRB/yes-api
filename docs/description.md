# YES CRM - Database Schema Documentation

This document provides a detailed description of the database schema for the YES CRM application, defined using Prisma.

## Core Principles

- **Naming Convention:** Table names are mapped in `PascalCase`. Field names are in `camelCase`.
- **Primary Keys:** All tables use a UUID v7 as the primary key (`id`).
- **Timestamps:** All tables include `createdAt` and `updatedAt` fields for auditing purposes.

## Schema Definition

### Core Entities

#### User

Represents a system user, such as an employee.

- **Fields:** `name`, `surname`, `govId` (unique), `bornDate`, `email` (unique), `alternativeEmail`, `password` (hashed), `username` (unique), `phoneNumber`, password recovery fields.
- **Relations:**
  - Each `User` has one `Address`.
  - Each `User` can own multiple `Accounts` (`AccountOwner`).
  - Each `User` can have multiple active or revoked `Profiles` through `UserProfile`.
  - Each `User` can submit `Orders` for approval and record approval decisions.

#### Profile

Represents a role or permission profile assigned to users.

- **Fields:** `name` (unique), `description`.
- **Relations:**
  - Can be assigned to multiple `Users` through `UserProfile`.
  - Can be linked to approval steps through `ApprovalStepProfile`.
  - Is recorded on each `ApprovalDecision` to identify which authorized profile was used by the approver.

#### UserProfile

A join table linking users to their permission profiles.

- **Fields:** `isActive`, `assignedAt`, `revokedAt`.
- **Relations:**
  - Links one `User` and one `Profile`.
- **Context:** Approval authorization should consider only active user-profile assignments. When a profile is removed from a user, keep the record and set `isActive` to `false` with `revokedAt` for auditability.

#### Account

Represents a client company or organization.

- **Fields:** `govId` (unique), `officialName`, `fantasyName`, `phoneNumber`, `email`.
- **Relations:**
  - Can have a hierarchical structure with a `mainAccount` and `subAccounts`.
  - Is owned by a single `User`.
  - Can have multiple `Contacts`.
  - Can have multiple `Quotes`.

#### Contact

Represents a person associated with an `Account`.

- **Fields:** `officialName`, `nickname`.
- **Relations:**
  - Belongs to one `Account`.
  - Can have multiple addresses through the `ContactAddress` join table.

#### Address

Stores physical address information.

- **Fields:** `name`, `street`, `neighborhood`, `number`, `postalCode`, `complement`.
- **Relations:**
  - Used by `User`, `Contact` (via `ContactAddress`), and `Branch`.
  - Linked to `Order` for shipping (`OrderShippingAddress`) and payment (`OrderPaymentAddress`).

### Sales & Billing

#### Quote

Represents a sales quote provided to an `Account`.

- **Fields:** `name`, `destination`, `finalValue`.
- **Relations:**
  - Belongs to one `Account`.
  - Can be converted into one or more `Orders`.
  - Contains multiple products via the `QuoteProduct` table.

#### QuoteProduct

A join table linking `Product` to a `Quote`, specifying quantity and pricing details for that quote.

- **Fields:** `quantity`, `price`, `discount`, `finalPrice`.
- **Relations:**
  - Links one `Quote` and one `Product`.

#### Order

Represents a confirmed sales order.

- **Fields:** `name`, `origin`, `destination`, `finalValue`, `approvalStatus`, `approvalSubmittedAt`, `approvalResolvedAt`, `approvalObservation`.
- **Relations:**
  - Can be generated from a `Quote`.
  - Has a `Status` (e.g., "Processing", "Shipped").
  - Is associated with a `PriceCatalog`.
  - Can have a `PaymentCondition`.
  - Has a designated `shippingAddress` and `paymentAddress` (both are `Address` relations).
  - Can be submitted to one `ApprovalPolicy`.
  - Stores the `User` that submitted the approval request.
  - Contains one `OrderApproval` record per approval step generated for the order.

#### ApprovalPolicy

Defines the approval rule set that can be applied to orders.

- **Fields:** `name` (unique), `description`, `isActive`, `minOrderValue`, `maxOrderValue`, `currency`.
- **Relations:**
  - Can be applied to multiple `Orders`.
  - Contains ordered `ApprovalSteps`.
- **Context:** Use `minOrderValue`, `maxOrderValue`, and `currency` to select which policy applies to an order amount. Only active policies should be used when submitting a new order for approval.

#### ApprovalStep

Represents one ordered stage in an approval policy.

- **Fields:** `sequence`, `name`, `description`, `requiredApprovals`, `isFinalStep`.
- **Relations:**
  - Belongs to one `ApprovalPolicy`.
  - Defines which `Profiles` can approve the step through `ApprovalStepProfile`.
  - Generates one `OrderApproval` per order when the policy is applied.
- **Context:** Steps must be processed by ascending `sequence`. A step is approved when it reaches `requiredApprovals` valid approvals from users whose profile is allowed for that step. A rejection should reject the pending approval flow for the order.

#### ApprovalStepProfile

A join table linking approval steps to the profiles allowed to approve them.

- **Relations:**
  - Links one `ApprovalStep` and one `Profile`.
- **Context:** This table is the profile-based authorization boundary for order approvals. A user may approve a step only when at least one active `UserProfile` is present in this table for that step.

#### OrderApproval

Represents the approval state of one step for one order.

- **Fields:** `status`, `requestedAt`, `resolvedAt`, `observation`.
- **Relations:**
  - Belongs to one `Order`.
  - Belongs to one `ApprovalStep`.
  - Contains multiple `ApprovalDecisions`.
- **Context:** There must be at most one `OrderApproval` per order and approval step. Its `status` starts as `PENDING` and becomes `APPROVED`, `REJECTED`, or `CANCELED` as decisions are recorded.

#### ApprovalDecision

Represents the audit record for a user's decision on an approval step.

- **Fields:** `decision`, `observation`, `decidedAt`.
- **Relations:**
  - Belongs to one `OrderApproval`.
  - Belongs to the `User` who decided.
  - Stores the `Profile` used to approve or reject.
- **Context:** The stored `profileId` must be one of the user's active `UserProfile` records and must also be allowed by `ApprovalStepProfile` for the related step. Each user can decide only once per `OrderApproval`.

#### Status

Defines the possible states of an `Order`.

- **Fields:** `name` (unique).

#### PaymentCondition

Defines the payment terms for an `Order`.

- **Fields:** `paymentType`, `installments`, `currency`, `finalAmount`, `interest`.

### Product & Catalog

#### Product

Represents an item that can be sold.

- **Fields:** `name`, `nickname`, `provider`, `basePrice`, `defaultCurrency`, `ncm`, `productCode` (unique), `pictureUrl`.
- **Relations:**
  - Can be part of multiple `PriceCatalogs` (via `PriceCatalogProduct`).
  - Can be part of a `Quote` (via `QuoteProduct`).
  - Can be stocked in multiple `Storages` (via `StorageProduct`).
  - Can be a component in a `BillOfMaterial` (BOM).
  - Can have a `BillOfMaterial` itself.

#### PriceCatalog

Represents a list of products with specific prices.

- **Fields:** `name`, `currency`.
- **Relations:**
  - Contains multiple products via the `PriceCatalogProduct` table.
  - An `Order` is always associated with a `PriceCatalog`.

#### PriceCatalogProduct

A join table linking a `Product` to a `PriceCatalog` with a specific `basePrice`.

#### BillOfMaterial (formerly Structure)

Represents the list of components required to build a `Product`.

- **Relations:**
  - Is associated with a single finished `Product`.
  - Contains multiple component products via the `BomItem` table.

#### BomItem (formerly StructureProduct)

A join table specifying the `quantity` of a component `Product` required in a `BillOfMaterial`.

### Logistics & Inventory

#### Branch

Represents a physical business location or office.

- **Fields:** `govId` (unique), `officialName`, `fantasyName`, `phoneNumber`, `email`.
- **Relations:**
  - Has one `Address`.
  - Can have multiple `Storages`.

#### Storage

Represents a warehouse or stock location.

- **Fields:** `name`, `storageCode` (unique).
- **Relations:**
  - Belongs to one `Branch`.
  - Contains multiple products via the `StorageProduct` table.

#### StorageProduct

A join table representing the inventory of a `Product` in a specific `Storage`.

- **Fields:** `availableQuantity`, `committedQuantity`, `totalQuantity`.
- **Relations:**
  - Links one `Storage` and one `Product`.
