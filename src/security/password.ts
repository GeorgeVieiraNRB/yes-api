import bcrypt from "bcrypt";
import { environment } from "../config/environment";

export const comparePasswords = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  if (!password || !hash) return false;

  return bcrypt.compare(password, hash);
};

export const hashPassword = async (password: string): Promise<string> => {
  if (!password) {
    throw new Error("password is required");
  }

  return bcrypt.hash(password, environment.PASSWORD_SALT_ROUNDS);
};
