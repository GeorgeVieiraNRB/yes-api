import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { findUsers } from "../models/users";
import { changeUserPassword } from "../services/users";
import type { ApiResponse } from "../types/response";
import type { ChangePasswordBody, UserIdParams } from "../validators/users";

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
  UserIdParams,
  ApiResponse,
  ChangePasswordBody
> = async (request, response): Promise<void> => {
  const { id } = request.params;
  const { password } = request.body;

  const { statusCode, body } = await changeUserPassword(id, password);
  response.status(statusCode).json(body);
};
