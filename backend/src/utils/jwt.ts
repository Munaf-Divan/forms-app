import jwt from "jsonwebtoken";
import { config } from "../config/env";

interface TokenPayload {
  userId: string;
}

/**
 * Signs a JWT token for the given user ID
 * @param userId - The user ID to include in the token
 * @returns The signed JWT token
 */
export const signToken = (userId: string): string => {
  if (!config.jwt.secret) {
    console.error("JWT_SECRET is not defined in environment variables");
    throw new Error("JWT configuration error");
  }

  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: "7d" } // Token valid for 7 days
  );
};

/**
 * Verifies a JWT token and returns the payload
 * @param token - The token to verify
 * @returns The token payload
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    if (!config.jwt.secret) {
      console.error("JWT_SECRET is not defined in environment variables");
      throw new Error("JWT configuration error");
    }

    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    throw new Error("Invalid or expired token");
  }
};
