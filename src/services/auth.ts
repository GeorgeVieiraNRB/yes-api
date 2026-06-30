import { findUserCredentialsByEmail } from "../models/users";
import { createAccessToken } from "../security/access-token";
import { comparePasswords } from "../security/password";

export const authenticateUser = async (email: string, password: string) => {
  const user = await findUserCredentialsByEmail(email);

  if (!user || !(await comparePasswords(password, user.password))) {
    return null;
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    surname: user.surname,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    user: safeUser,
    token: createAccessToken(safeUser),
  };
};
