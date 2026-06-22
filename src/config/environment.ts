import "dotenv/config";
import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const environmentSchema = z.object({
  DATABASE_URL: z
    .url("DATABASE_URL must be a valid URL")
    .refine(
      (value) => ["postgres:", "postgresql:"].includes(new URL(value).protocol),
      "DATABASE_URL must use the PostgreSQL protocol",
    ),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must contain at least 32 characters"),
  ADMIN_EMAIL: z.email("ADMIN_EMAIL must be a valid email address"),
  ADMIN_PASSWORD: z
    .string()
    .min(12, "ADMIN_PASSWORD must contain at least 12 characters")
    .regex(/[a-z]/, "ADMIN_PASSWORD must contain a lowercase letter")
    .regex(/[A-Z]/, "ADMIN_PASSWORD must contain an uppercase letter")
    .regex(/\d/, "ADMIN_PASSWORD must contain a number")
    .regex(/[^A-Za-z0-9]/, "ADMIN_PASSWORD must contain a special character"),
  PASSWORD_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  IS_PRODUCTION: booleanFromString,
  PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error(
    "Invalid environment variables",
    z.formatError(parsedEnvironment.error),
  );

  throw new Error("Invalid environment variables");
}

export const environment = parsedEnvironment.data;
