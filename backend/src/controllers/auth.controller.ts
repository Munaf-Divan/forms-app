import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { HttpException } from "../middlewares/error.middleware";
import { UserType } from "../models/user.model";

export class AuthController {
  private static instance: AuthController;

  private constructor() {}

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  public async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fullName, email, password, userType, phoneNumber } = req.body;

      // Basic validation
      if (!fullName || !email || !password || !phoneNumber) {
        throw new HttpException(400, "Missing required fields");
      }

      // Validate user type
      if (userType && !Object.values(UserType).includes(userType)) {
        throw new HttpException(
          400,
          `Invalid user type. Must be one of: ${Object.values(UserType).join(
            ", "
          )}`
        );
      }

      const result = await authService.signup({
        fullName,
        email,
        password,
        userType: userType || UserType.CONSUMER,
        phoneNumber,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        throw new HttpException(400, "Email and password are required");
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = AuthController.getInstance();
