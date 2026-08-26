import type { ApiResponse } from "../types/response";

const defaultMessagesByStatusCode = {
  400: "Bad request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Route not found",
  500: "Internal server error",
} as const;

export type ApiErrorStatusCode = keyof typeof defaultMessagesByStatusCode;

export class ApiError extends Error {
  readonly statusCode: ApiErrorStatusCode;

  constructor(statusCode: ApiErrorStatusCode, message?: string) {
    super(message ?? defaultMessagesByStatusCode[statusCode]);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }

  toResponse(): ApiResponse {
    return {
      success: false,
      message: this.message,
      error: { message: this.message },
    };
  }
}

export const badRequest = (message?: string): ApiError =>
  new ApiError(400, message);

export const unauthorized = (): ApiError => new ApiError(401);

export const forbidden = (): ApiError => new ApiError(403);

export const notFound = (): ApiError => new ApiError(404);

export const internalServerError = (): ApiError => new ApiError(500);
