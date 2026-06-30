import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { authenticateUser } from "../services/auth";
import type { ApiResponse } from "../types/response";
import type { LoginBody } from "../validators/auth";

type LoginResponse = NonNullable<Awaited<ReturnType<typeof authenticateUser>>>;

export const login: RequestHandler<
  ParamsDictionary,
  ApiResponse<LoginResponse>,
  LoginBody
> = async (
  request,
  response,
): Promise<void> => {
  const { email, password } = request.body;

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
