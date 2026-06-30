import { Router } from "express";
import { listUsers, updateUserPassword } from "../controllers/users";
import { authenticate } from "../middlewares/auth";
import { authorizeProfiles, authorizeSelf } from "../middlewares/authorization";
import { validateRequest } from "../middlewares/validate";
import {
  changePasswordBodySchema,
  userIdParamsSchema,
} from "../validators/users";

export const userRoutes = Router();

userRoutes.get("/", authenticate, authorizeProfiles(["ADMIN"]), listUsers);

userRoutes.patch(
  "/:id/password",
  authenticate,
  validateRequest({
    params: userIdParamsSchema,
    body: changePasswordBodySchema,
  }),
  authorizeSelf("id"),
  updateUserPassword,
);

userRoutes.patch(
  "/another/:id/password",
  authenticate,
  validateRequest({
    params: userIdParamsSchema,
    body: changePasswordBodySchema,
  }),
  authorizeProfiles(["ADMIN"]),
  updateUserPassword,
);
