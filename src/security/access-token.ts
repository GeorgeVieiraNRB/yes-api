import jwt from "jsonwebtoken";
import { environment } from "../config/environment";
import type { JwtUser } from "../types/auth";

export const createAccessToken = (user: JwtUser): string =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    environment.JWT_SECRET,
    { expiresIn: "15m" },
  );
