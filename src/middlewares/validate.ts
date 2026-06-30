import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ZodType } from "zod";
import type { ApiResponse } from "../types/response";

interface RequestSchemas {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
}

const validationErrorResponse = (message: string): ApiResponse => ({
  success: false,
  message: "Validation failed",
  error: { message },
});

export const validateRequest = ({
  params,
  query,
  body,
}: RequestSchemas): RequestHandler => {
  return (request, response, next): void => {
    const parsedParams = params?.safeParse(request.params);

    if (parsedParams && !parsedParams.success) {
      response
        .status(400)
        .json(validationErrorResponse(parsedParams.error.issues[0].message));
      return;
    }

    const parsedQuery = query?.safeParse(request.query);

    if (parsedQuery && !parsedQuery.success) {
      response
        .status(400)
        .json(validationErrorResponse(parsedQuery.error.issues[0].message));
      return;
    }

    const parsedBody = body?.safeParse(request.body);

    if (parsedBody && !parsedBody.success) {
      response
        .status(400)
        .json(validationErrorResponse(parsedBody.error.issues[0].message));
      return;
    }

    if (parsedParams) {
      request.params = parsedParams.data as ParamsDictionary;
    }

    if (parsedQuery) {
      request.query = parsedQuery.data as typeof request.query;
    }

    if (parsedBody) {
      request.body = parsedBody.data;
    }

    next();
  };
};
