import { Router } from "express";
import { listUsers, updateUserPassword } from "../controllers/users";
import { authenticate } from "../middlewares/auth";
import { authorizeProfiles, authorizeSelf } from "../middlewares/authorization";

export const userRoutes = Router();

userRoutes.get("/", authenticate, authorizeProfiles(["ADMIN"]), listUsers);

userRoutes.patch(
  "/:id/password",
  authenticate,
  authorizeSelf("id"),
  updateUserPassword,
);

userRoutes.patch(
  "/another/:id/password",
  authenticate,
  authorizeProfiles(["ADMIN"]),
  updateUserPassword,
);
