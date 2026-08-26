import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { environment } from "../config/environment";
import { forbidden, unauthorized } from "../errors/api-error";
import { findUserStatusById } from "../models/users";
import type { AuthTokenPayload } from "../types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

const isAuthTokenPayload = (
  payload: string | JwtPayload,
): payload is AuthTokenPayload =>
  typeof payload !== "string" &&
  typeof payload.id === "string" &&
  typeof payload.email === "string";

export const authenticate: RequestHandler = (request, _response, next): void => {
  const authorization = request.headers.authorization;
  const [scheme, token] = authorization?.trim().split(/\s+/) ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    next(unauthorized());
    return;
  }

  try {
    const payload = jwt.verify(token, environment.JWT_SECRET);

    if (!isAuthTokenPayload(payload)) {
      next(unauthorized());
      return;
    }

    request.user = payload;
    next();
  } catch {
    next(unauthorized());
  }
};

export const requireActiveUser: RequestHandler = async (
  request,
  _response,
  next,
): Promise<void> => {
  if (!request.user) {
    next(unauthorized());
    return;
  }

  const user = await findUserStatusById(request.user.id);

  if (!user?.isActive) {
    next(forbidden());
    return;
  }

  next();
};
