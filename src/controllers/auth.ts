import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { authenticateUser } from "../services/auth";
import type { ApiResponse } from "../types/response";

type LoginResponse = NonNullable<Awaited<ReturnType<typeof authenticateUser>>>;

export const login: RequestHandler<
  ParamsDictionary,
  ApiResponse<LoginResponse>
> = async (
  request,
  response,
): Promise<void> => {
  const { email, password } = request.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    response.status(400).json({
      success: false,
      message: "Email and password are required",
      error: { message: "Email and password are required" },
    });
    return;
  }

  const authentication = await authenticateUser(email, password);

  if (!authentication) {
    response.status(401).json({
      success: false,
      message: "Invalid credentials",
      error: { message: "Invalid credentials" },
    });
    return;
  }

  response.status(200).json({
    success: true,
    message: "ok",
    data: authentication,
    error: null,
  });
};
