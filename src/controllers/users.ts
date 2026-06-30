import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { findUsers } from "../models/users";
import { changeUserPassword } from "../services/users";
import type { ApiResponse } from "../types/response";

type ListUsersResponse = Awaited<ReturnType<typeof findUsers>>;

export const listUsers: RequestHandler<
  ParamsDictionary,
  ApiResponse<ListUsersResponse>
> = async (_request, response): Promise<void> => {
  const users = await findUsers();

  response.status(200).json({
    success: true,
    message: "ok",
    data: users,
    error: null,
  });
};

export const updateUserPassword: RequestHandler<
  ParamsDictionary,
  ApiResponse
> = async (request, response): Promise<void> => {
  const { id } = request.params;
  const { password } = request.body ?? {};

  if (typeof id !== "string" || id.length === 0) {
    response.status(400).json({
      success: false,
      message: "User ID is required",
      error: { message: "User ID is required" },
    });
    return;
  }

  if (typeof password !== "string" || password.length === 0) {
    response.status(400).json({
      success: false,
      message: "Password is required",
      error: { message: "Password is required" },
    });
    return;
  }

  const { statusCode, body } = await changeUserPassword(id, password);
  response.status(statusCode).json(body);
};
