import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { prisma } from "../database/prisma-client";
import type { ApiResponse } from "../types/response";

const errorResponse = (message: string): ApiResponse => ({
  success: false,
  message,
  error: { message },
});

const unauthorizedResponse = errorResponse("Unauthorized");

export const authorizeSelf = (
  paramName = "id",
): RequestHandler<ParamsDictionary, ApiResponse> => {
  return (request, response, next): void => {
    const resourceUserId = request.params[paramName];

    if (!request.user) {
      response.status(401).json(unauthorizedResponse);
      return;
    }

    if (typeof resourceUserId !== "string" || resourceUserId.length === 0) {
      response.status(400).json(errorResponse("User ID is required"));
      return;
    }

    if (request.user.id !== resourceUserId) {
      response
        .status(403)
        .json(errorResponse("You cannot access another user's resource"));
      return;
    }

    next();
  };
};

export const authorizeProfiles = (
  profiles: string[],
): RequestHandler<ParamsDictionary, ApiResponse> => {
  return async (request, response, next): Promise<void> => {
    if (!request.user) {
      response.status(401).json(unauthorizedResponse);
      return;
    }

    const userProfile = await prisma.userProfile.findFirst({
      where: {
        userId: request.user.id,
        isActive: true,
        revokedAt: null,
        profile: {
          name: { in: profiles },
        },
      },
      select: { userId: true },
    });

    if (!userProfile) {
      response.status(403).json(errorResponse("Required profile was not found"));
      return;
    }

    next();
  };
};
