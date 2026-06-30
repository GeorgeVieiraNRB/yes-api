import type { JwtPayload } from "jsonwebtoken";

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export interface JwtUser {
  id: string;
  email: string;
}
