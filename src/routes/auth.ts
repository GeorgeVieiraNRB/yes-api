import { Router } from "express";
import { login } from "../controllers/auth";
import { validateRequest } from "../middlewares/validate";
import { loginBodySchema } from "../validators/auth";

export const authRoutes = Router();

authRoutes.post("/login", validateRequest({ body: loginBodySchema }), login);
