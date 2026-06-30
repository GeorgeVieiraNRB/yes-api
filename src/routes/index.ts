import { Router } from "express";
import { authRoutes } from "./auth";
import { healthRoutes } from "./health";
import { userRoutes } from "./users";

export const router = Router();

router.use(healthRoutes);
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/users", userRoutes);
