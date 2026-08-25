import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { environment } from "../config/environment";
import { findUserStatusById } from "../models/users";
import type { AuthTokenPayload } from "../types/auth";
import type { ApiResponse } from "../types/response";

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

const errorResponse = (message: string): ApiResponse => ({
  success: false,
  message,
  error: { message },
});

const unauthorizedResponse = errorResponse("Unauthorized");
const invalidTokenResponse = errorResponse("Invalid token");
const disabledUserResponse = errorResponse("User account is disabled");

export const authenticate: RequestHandler = (request, response, next): void => {
  const authorization = request.headers.authorization;
  const [scheme, token] = authorization?.trim().split(/\s+/) ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    response.status(401).json(unauthorizedResponse);
    return;
  }

  try {
    const payload = jwt.verify(token, environment.JWT_SECRET);

    if (!isAuthTokenPayload(payload)) {
      response.status(401).json(invalidTokenResponse);
      return;
    }

    request.user = payload;
    next();
  } catch {
    response.status(401).json(invalidTokenResponse);
  }
};

export const requireActiveUser: RequestHandler = async (
  request,
  response,
  next,
): Promise<void> => {
  if (!request.user) {
    response.status(401).json(unauthorizedResponse);
    return;
  }

  const user = await findUserStatusById(request.user.id);

  if (!user?.isActive) {
    response.status(403).json(disabledUserResponse);
    return;
  }

  next();
};
