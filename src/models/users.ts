import { prisma } from "../database/prisma-client";

export const findUsers = () =>
  prisma.user.findMany({
    select: {
      name: true,
      surname: true,
      email: true,
      createdAt: true,
    },
    take: 20,
  });

export const findUserCredentialsByEmail = (email: string) =>
  prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      surname: true,
      username: true,
      email: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });

export const findUserPasswordById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: { password: true },
  });

export const updateUserPassword = (id: string, password: string) =>
  prisma.user.update({
    where: { id },
    data: { password },
  });

export const findUserById = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      surname: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
