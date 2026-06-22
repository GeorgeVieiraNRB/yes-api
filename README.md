# YES API

![YES logo](assets/yes-logo-transparent.png)

Backend for YES CRM. The project covers customer management, catalogs, quotes,
orders, inventory, and profile-based order approval.

## Current status

The database foundation is the most complete part of the project. The repository
currently has:

- a Prisma schema, initial migration, and idempotent development seed;
- centralized environment validation with Zod;
- a minimal Express server;
- an initial MVC folder structure with separate application bootstrap;
- password and access-token helpers;
- initial request-validation middleware.

Routes, use cases, authorization, refresh sessions, tests, and production
hardening are not implemented yet. See [docs/todo.md](docs/todo.md) for the
delivery order.

## Stack decision

The application should continue with the stack already used by its source code:

- Node.js and TypeScript;
- Express 5 as the HTTP framework;
- PostgreSQL and Prisma ORM;
- Zod for environment and request validation;
- bcrypt for password hashing;
- JSON Web Tokens for short-lived access tokens;
- Biome for formatting and linting.

Express is the only HTTP framework and Zod is the only schema-validation library.
Keeping one framework and one validation/error model avoids duplicated plugins,
types, and middleware conventions.

## Setup

Requirements: Node.js, npm, and PostgreSQL.

```powershell
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run dev
```

On PowerShell installations that block `npx`, use `npx.cmd`.

Environment variables are documented in [.env.example](.env.example) and
validated on startup by `src/config/environment.ts`. Do not commit `.env`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with file watching |
| `npm run build` | Compile TypeScript and copy the generated Prisma engine |
| `npm run build:production` | Generate Prisma Client and build a deployable `dist` |
| `npm run prisma:validate` | Validate the Prisma schema |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create/apply a development migration |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run seed` | Insert the initial admin and sample CRM data |

The seed reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment and also
creates the base profiles `ADMIN`, `SALES`, `FINANCE`, `MANAGER`, and
`LOGISTICS`.

## Documentation

- [Domain and business rules](docs/description.md)
- [Suggested application structure](docs/architecture.md)
- [Prioritized implementation plan](docs/todo.md)

The Prisma schema remains the source of truth for the database shape. The
business-rules document is the source of truth for behavior that cannot be
expressed by database constraints alone.

## Source layout

```text
src/
  app.ts            Express configuration
  server.ts         HTTP process startup
  config/           Validated application configuration
  controllers/      MVC request handlers
  database/         Prisma Client lifecycle
  middlewares/      Express request pipeline
  routes/           URL-to-controller mapping
  security/         Password and token primitives
  types/            Shared TypeScript contracts
```

Prisma models currently provide the MVC Model foundation. Domain-specific
`models`, `services`, and `validators` should be added only as routes and business
use cases are implemented; empty placeholder directories are intentionally
avoided.

## Production artifact

Run:

```powershell
npm ci
npm run build:production
```

The deployable application consists of `dist/`, `package.json`, and
`package-lock.json`. Install runtime dependencies with `npm ci --omit=dev` in the
deployment image, then run `npm start`.

The build copies Prisma's platform-specific native query engine into
`dist/generated/prisma`. Build the artifact on the same operating-system family
and CPU architecture used in production, or configure the corresponding Prisma
binary target.
