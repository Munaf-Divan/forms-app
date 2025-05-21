import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User, IUserDocument } from "../models/user.model";
import { HttpException } from "./error.middleware";

// Extend Request interface to include user property
export interface AuthRequest extends Request {
  user?: IUserDocument;
}

/**
 * Middleware to protect routes
 * Verifies JWT token and attaches user to request
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    // If no token found
    if (!token) {
      return next(new HttpException(401, "Not authorized, no token provided"));
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Get user from database (excluding password)
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new HttpException(401, "User not found"));
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return next(new HttpException(401, "Not authorized, token failed"));
    }
  } catch (error) {
    next(error);
  }
};
