import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/\d/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const userIdParamsSchema = z.object({
  id: z.uuid("User ID must be a valid UUID"),
});

export const changePasswordBodySchema = z.object({
  password: passwordSchema,
});

export const createUserBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  surname: z.string().trim().min(1, "Surname is required"),
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address")),
  password: passwordSchema,
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
