import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ApiResponse } from "../types/response";

export const isUp: RequestHandler<ParamsDictionary, ApiResponse> = (
  _request,
  response,
): void => {
  response.status(200).json({
    success: true,
    message: "yes api is working correctly",
    error: null,
  });
};
