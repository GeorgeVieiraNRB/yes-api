import { Router } from "express";
import { isReady } from "../controllers/is-ready";
import { isUp } from "../controllers/is-up";
import { authenticate } from "../middlewares/auth";
import { authorizeProfiles } from "../middlewares/authorization";

export const healthRoutes = Router();

healthRoutes.get("/", isUp);
healthRoutes.get("/is-up", isUp);

healthRoutes.get(
  "/is-ready",
  authenticate,
  authorizeProfiles(["ADMIN"]),
  isReady,
);
