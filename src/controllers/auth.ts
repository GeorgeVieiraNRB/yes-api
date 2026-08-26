import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { unauthorized } from "../errors/api-error";
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
  next,
): Promise<void> => {
  const { email, password } = request.body;

  const authentication = await authenticateUser(email, password);

  if (!authentication) {
    next(unauthorized());
    return;
  }

  response.status(200).json({
    success: true,
    message: "ok",
    data: authentication,
    error: null,
  });
};
