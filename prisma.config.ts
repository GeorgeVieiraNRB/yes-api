import { defineConfig } from "prisma/config";
import { environment } from "./src/config/environment";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: environment.DATABASE_URL,
  },
});
