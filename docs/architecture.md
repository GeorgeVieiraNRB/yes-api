# MVC application structure

## Direction

YES API uses an MVC-oriented Express structure adapted to the code that exists
today. It is a modular monolith, not a collection of domain microservices or a
deep enterprise hierarchy.

For this JSON API, MVC maps as follows:

- **Model:** Prisma schema plus model/data-access modules that read and persist
  domain data.
- **View:** JSON response contracts. There is no template or `views` directory.
- **Controller:** Express handlers that translate HTTP input into a use-case call
  and map its result to an HTTP response.

Routes, middleware, validation, services, and security helpers support MVC but do
not replace its boundaries.

## Current structure

```text
src/
  app.ts
  server.ts
  config/
    environment.ts
  controllers/
    health.ts
  database/
    prisma-client.ts
  generated/
    prisma/                    # Generated; never edit or commit
  middlewares/
    auth.ts
  routes/
    index.ts
  security/
    access-token.ts
    password.ts
  types/
    auth.ts
```

### Directory responsibilities

| Directory | Responsibility | Must not contain |
| --- | --- | --- |
| `config` | Parse and validate external configuration | Domain rules or database queries |
| `controllers` | HTTP request/response orchestration | Prisma queries or business decisions |
| `database` | Prisma Client creation and lifecycle | Domain-specific queries |
| `middlewares` | Cross-cutting Express request checks | Feature workflows |
| `routes` | Paths, middleware order, and controllers | Business logic |
| `security` | Password hashing and token primitives | Login/session workflows |
| `types` | Shared TypeScript contracts | Runtime behavior |
| `generated` | Generated Prisma Client | Handwritten code |

The former generic `modules` directory was removed because it mixed security,
Express middleware, and types. Focused names make ownership visible without
opening the file.

## Growth structure

Add folders and files when the first real feature requires them:

```text
src/
  controllers/
    auth-controller.ts
    user-controller.ts
    order-controller.ts
  models/
    user-model.ts
    order-model.ts
    approval-model.ts
  routes/
    auth-routes.ts
    user-routes.ts
    order-routes.ts
    index.ts
  services/
    auth-service.ts
    order-service.ts
    approval-service.ts
  validators/
    auth-validator.ts
    order-validator.ts
```

Use feature names in filenames and keep the layer in the directory name. The
top-level MVC folders are easier to navigate at this scale than nesting every
feature inside another container directory.

### Request flow

```text
route
  -> validation/authentication middleware
  -> controller
  -> service
  -> model
  -> database/prisma-client
```

- A controller may call a model directly for a trivial CRUD operation.
- A service is required when a use case has business rules, multiple model calls,
  transactions, or external side effects.
- Models accept domain-oriented parameters and hide Prisma query details.
- Controllers never return raw user/password/session records.

## Bootstrap

`app.ts` creates and configures Express but does not listen on a port. This makes
the application importable by integration tests. Middleware registration order
should be:

1. request ID and logging;
2. security headers and configured CORS;
3. body parsing and request-size limits;
4. public routes;
5. authenticated `/api/v1` routes;
6. not-found middleware;
7. centralized error middleware.

`server.ts` starts the HTTP listener and will own graceful shutdown. On
`SIGINT`/`SIGTERM`, it must stop accepting requests and disconnect the exported
client from `database/prisma-client.ts`.

`config/environment.ts` is the only handwritten file allowed to read
`process.env`. Callers import the validated `environment` object.

## Public, protected, and versioned routes

Health and operational endpoints are not versioned because they describe the
running service, not the business API:

```text
GET /health
GET /ready
```

Business routes are mounted below `/api/v1`. Version the external contract, not
controller or model directories. A future breaking contract can be mounted at
`/api/v2` while reusing the same services and models.

Keep route files organized by feature (`auth-routes.ts`, `user-routes.ts`), not
in `public/` and `private/` directories. The access boundary belongs to router
composition. When feature routes exist, `routes/index.ts` should follow this
shape:

```ts
const publicV1Routes = Router();
const protectedV1Routes = Router();

publicV1Routes.use("/auth", publicAuthRoutes);

protectedV1Routes.use(authenticate);
protectedV1Routes.get("/auth/me", getCurrentUser);
protectedV1Routes.use("/users", userRoutes);
protectedV1Routes.use("/orders", orderRoutes);

router.use("/api/v1", publicV1Routes, protectedV1Routes);
```

This gives protected routes a default-deny boundary: anything mounted on
`protectedV1Routes` passes through authentication. Authorization by profile stays
closer to each route because required profiles differ by operation. Login,
refresh, and password-reset requests are explicitly public; logout and `/me` are
protected.

Do not create these future route/controller files until their use cases are
implemented. The current `routes/index.ts` contains only the health routes.

## Models and Prisma

`prisma/schema.prisma` remains the database schema source of truth. Generated
code lives in `src/generated/prisma`; handwritten code imports Prisma only through
`database/prisma-client.ts`, except the standalone seed.

`src/generated/prisma` should remain where it is. Moving generated files under
`database` would mix machine output with handwritten lifecycle code; moving them
into `prisma/` would put runtime source beside schema and migrations. The current
location is explicit, ignored by Git, and easy to regenerate.

Run `npm run prisma:generate` after installing dependencies and whenever the
schema or TypeScript module configuration changes. `npm run build:production`
generates the client, cleans `dist`, compiles TypeScript, and copies Prisma's
native query engine to `dist/generated/prisma`; `tsc` alone does not copy native
files.

The production artifact is `dist/` plus `package.json` and `package-lock.json`.
Production dependencies are installed with `npm ci --omit=dev`. Generate/build on
the deployment platform, or explicitly configure Prisma binary targets when the
build and runtime platforms differ.

Do not create one class per Prisma table merely to satisfy the word “Model.” Add
a model module when the application needs a stable data-access boundary. Prefer
models aligned to business aggregates, for example `order-model.ts` can own order
header, lines, and approval-loading queries.

Multi-record business transitions belong in services and use Prisma transactions.
Approval submission, approval decisions, and inventory reservation are examples.

## Authentication

Security primitives and business workflows are separate:

- `security/password.ts` hashes and compares passwords;
- `security/access-token.ts` signs short-lived access tokens;
- `middlewares/auth.ts` validates Bearer tokens for protected routes;
- the future `auth-service.ts` will perform login, refresh rotation, logout, and
  session revocation;
- the future `auth-controller.ts` will expose those workflows over HTTP.

Recommended request chain:

```text
authenticate -> load active profiles -> authorize -> validate -> controller
```

Authorization must use active profiles from persistence or a short-lived cache,
not roles supplied by the request.

## Planned route baseline

```text
GET    /health
GET    /ready

POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

/api/v1/users
/api/v1/profiles
/api/v1/accounts
/api/v1/contacts
/api/v1/products
/api/v1/catalogs
/api/v1/quotes
/api/v1/orders
/api/v1/orders/:orderId/approvals
/api/v1/branches
/api/v1/storages
```

## API conventions

- Use `camelCase` JSON, UUID path parameters, UTC timestamps, and ISO currency
  codes.
- Validate and normalize all external input before the controller.
- Return `401` for missing/invalid identity and `403` for insufficient access.
- Return `409` for uniqueness conflicts and invalid state transitions.
- Use a standard error body with `code`, `message`, optional `details`, and
  `requestId`.
- Map database records to response contracts instead of returning Prisma records
  blindly.

## Request validation

Use Zod for environment, path, query, and body schemas. Zod is preferred over
`express-validator` because it provides one declarative schema, inferred
TypeScript types, reusable parsing outside Express, and structured errors that can
feed the global API error format.

Create `validators/` when the first feature payload is implemented. A validation
middleware should accept a Zod schema, parse `{ params, query, body }`, replace
inputs with normalized values, and forward failures to the central error handler.
Do not add ad-hoc validation chains inside route files.

## Testing

- Unit-test services and calculations without Express.
- Integration-test `app.ts` against an isolated PostgreSQL database without
  opening the production listener.
- Test models for query filters, constraints, and transaction behavior.
- Test approval and inventory concurrency explicitly.
- Run the seed twice in tests to preserve idempotency.
