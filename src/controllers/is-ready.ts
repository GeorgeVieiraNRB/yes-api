import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { prisma } from "../database/prisma-client";
import type { ApiResponse } from "../types/response";

type ReadinessData = {
  database: "ready";
};

export const isReady: RequestHandler<
  ParamsDictionary,
  ApiResponse<ReadinessData>
> = async (_request, response): Promise<void> => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.status(200).json({
      success: true,
      message: "yes api is ready",
      data: { database: "ready" },
      error: null,
    });
  } catch {
    response.status(503).json({
      success: false,
      message: "yes api is not ready",
      error: { message: "Database connection failed" },
    });
  }
};
