import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { prisma } from "../database/prisma-client";
import { badRequest, forbidden, unauthorized } from "../errors/api-error";
import type { ApiResponse } from "../types/response";

const findAuthorizationUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperUser: true },
  });
};

export const authorizeSelf = (
  paramName = "id",
): RequestHandler<ParamsDictionary, ApiResponse> => {
  return (request, _response, next): void => {
    const resourceUserId = request.params[paramName];

    if (!request.user) {
      next(unauthorized());
      return;
    }

    if (typeof resourceUserId !== "string" || resourceUserId.length === 0) {
      next(badRequest("User ID is required"));
      return;
    }

    if (request.user.id !== resourceUserId) {
      next(forbidden());
      return;
    }

    next();
  };
};

export const authorizeProfiles = (
  profiles: string[] = [],
): RequestHandler<ParamsDictionary, ApiResponse> => {
  return async (request, _response, next): Promise<void> => {
    if (!request.user) {
      next(unauthorized());
      return;
    }

    const user = await findAuthorizationUser(request.user.id);

    if (user?.isSuperUser) {
      next();
      return;
    }

    if (profiles.length === 0) {
      next(forbidden());
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
      next(forbidden());
      return;
    }

    next();
  };
};
