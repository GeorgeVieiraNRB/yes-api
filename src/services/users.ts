import {
  findUserPasswordById,
  updateUserPassword,
} from "../models/users";
import { comparePasswords, hashPassword } from "../security/password";
import type { ControllerResponse } from "../types/response";

const passwordChangeResponse = (
  statusCode: number,
  success: boolean,
  message: string,
): ControllerResponse => ({
  statusCode,
  body: {
    success,
    message,
    error: success ? null : { message },
  },
});

export const changeUserPassword = async (
  id: string,
  password: string,
): Promise<ControllerResponse> => {
  const user = await findUserPasswordById(id);

  if (!user) {
    return passwordChangeResponse(404, false, "User not found");
  }

  if (await comparePasswords(password, user.password)) {
    return passwordChangeResponse(
      400,
      false,
      "New password cannot be the same as the old password",
    );
  }

  const passwordHash = await hashPassword(password);
  await updateUserPassword(id, passwordHash);

  return passwordChangeResponse(200, true, "Password changed successfully");
};
