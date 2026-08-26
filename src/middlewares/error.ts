import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError, internalServerError, notFound } from "../errors/api-error";

export const notFoundMiddleware: RequestHandler = (
  _request,
  _response,
  next,
) => {
  next(notFound());
};

export const apiErrorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
): void => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const apiError = error instanceof ApiError ? error : internalServerError();

  if (!(error instanceof ApiError)) {
    console.error(error);
  }

  response.status(apiError.statusCode).json(apiError.toResponse());
};
