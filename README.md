# YES API

![YES-LOGO](/assets/yes-logo-transparent.png)

Backend project for the YES CRM platform. The repository currently contains the database/domain foundation for a CRM API, built around Prisma, PostgreSQL, and TypeScript. The HTTP API stack is planned with Fastify and related plugins, but the current committed source is focused on Prisma schema, migrations, seed data, documentation, and project configuration.

## Stack

- Node.js with TypeScript
- Prisma ORM
- PostgreSQL
- Fastify dependencies for the future HTTP API
- Zod for validation
- Bcrypt for password hashing
- Biome configuration for formatting and linting

## Current Project Status

Implemented:

- Prisma schema for the CRM domain
- Initial migration under `prisma/migrations`
- Prisma seed with an admin user and sample base data
- Database/domain documentation in `docs/description.md`
- Backend task backlog in `docs/todo.md`

Planned but not yet implemented in `src/`:

- Fastify server entrypoint
- API routes/controllers
- Authentication and authorization flow
- Request validation schemas
- Services, repositories, middlewares, and tests

## Domain Overview

The schema models a CRM workflow with:

- Users, profiles, and user-profile assignments
- Accounts, contacts, and addresses
- Products, price catalogs, bill of materials, and inventory
- Quotes and orders
- Payment conditions
- Branches and storage locations
- Order approval policies, approval steps, allowed approver profiles, order approvals, and approval decisions

More detail is available in `docs/description.md`.

## Requirements

- Node.js
- npm
- PostgreSQL database

The project uses Prisma Client generated into:

```text
generated/prisma
```

That folder is ignored by Git and should be regenerated locally.

## Environment Variables

Create a `.env` file based on `.env.example`:

```powershell
Copy-Item .env.example .env
```

Required variables:

```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="ChangeMe!123"
PASSWORD_SALT_ROUNDS=12
```

`ADMIN_PASSWORD` is used by the seed for the initial admin user. If it is not set, the seed falls back to `Admin@123456`, which is only suitable for local development.

## Install

```powershell
npm install
```

If PowerShell blocks `npx` because of execution policy, use `npx.cmd` instead of `npx`.

## Prisma Commands

Validate the schema:

```powershell
npm run prisma:validate
```

Generate Prisma Client:

```powershell
npm run prisma:generate
```

Create and apply a development migration:

```powershell
npm run prisma:migrate
```

Or name a migration explicitly:

```powershell
npx.cmd prisma migrate dev --name migration_name
```

Apply existing migrations to a deployed/staging database:

```powershell
npx.cmd prisma migrate deploy
```

Open Prisma Studio:

```powershell
npm run prisma:studio
```

## Seed

Run the seed:

```powershell
npm run seed
```

Or through Prisma:

```powershell
npx.cmd prisma db seed
```

The seed is designed to be idempotent and creates:

- Admin user: `admin@yescrm.local`
- Username: `admin`
- Profiles: `ADMIN`, `SALES`, `FINANCE`, `MANAGER`, `LOGISTICS`
- Base order statuses
- Example branch, storage, account, contact, address, catalog, payment condition, products, quote, order, and approval workflow

## Migrations

Commit Prisma migrations to Git.

Files that should be committed:

```text
prisma/schema.prisma
prisma/migrations/
```

Generated Prisma Client output should not be committed. The repository already ignores:

```text
/generated/prisma
```

## Scripts

```json
{
  "dev": "tsx watch src/server.ts",
  "start": "node dist/server.js",
  "build": "tsc",
  "prisma:validate": "prisma validate",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "seed": "tsx prisma/seed.ts"
}
```

Note: `dev`, `start`, and `build` expect future application source files. At the moment, there is no committed `src/` directory.

## Project Structure

```text
assets/                 Brand and logo assets
docs/                   Domain documentation and backend TODO list
generated/prisma/        Local Prisma Client output, ignored by Git
prisma/
  migrations/            Database migration history
  schema.prisma          Prisma schema
  seed.ts                Initial admin and sample base records
biome.json               Formatter and linter configuration
package.json             npm scripts and dependencies
prisma.config.ts         Prisma CLI configuration
```

## Typical Local Setup

```powershell
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

After that, the database should contain the schema and base records needed for local development.

## Documentation

- `docs/description.md`: database and domain model documentation
- `docs/todo.md`: backend implementation backlog

## Next Steps

- Add the `src/` application structure
- Implement the Fastify server
- Add authentication and session handling
- Add profile-based authorization
- Add routes for users, accounts, products, quotes, orders, approvals, branches, and inventory
- Add tests for authentication, authorization, seeds, and approval workflows
