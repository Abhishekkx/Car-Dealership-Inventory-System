/**
 * Issues signed JWTs for authenticated sessions.
 */
import jwt, { type SignOptions } from "jsonwebtoken";
import { IUser } from "../models/User";

interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}

/** Creates a JWT containing user id, name, email, and role. */
export function signToken(user: IUser): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const payload: TokenPayload = {
    id: user.id,
    name: user.name || user.email.split("@")[0],
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}
