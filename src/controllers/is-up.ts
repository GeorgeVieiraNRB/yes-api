import type { RequestHandler } from "express";

export const isUp: RequestHandler = (_request, response): void => {
  response.status(200).json({
    success: true,
    message: "yes api is working correctly",
  });
};
