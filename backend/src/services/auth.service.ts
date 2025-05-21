import { User, IUser, IUserDocument, UserType } from "../models/user.model";
import { signToken } from "../utils/jwt";
import { HttpException } from "../middlewares/error.middleware";
import mongoose from "mongoose";

interface SignupInput {
  fullName: string;
  email: string;
  password: string;
  userType: UserType;
  phoneNumber: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    email: string;
    userType: UserType;
    phoneNumber: string;
  };
  token: string;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private toDTO(user: IUserDocument) {
    return {
      id: user._id ? user._id.toString() : "",
      fullName: user.fullName,
      email: user.email,
      userType: user.userType,
      phoneNumber: user.phoneNumber,
    };
  }

  public async signup(input: SignupInput): Promise<AuthResponse> {
    try {
      console.log(`Attempting to register user with email: ${input.email}`);

      // Check if user already exists
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        console.log(`Signup failed: Email ${input.email} already in use`);
        throw new HttpException(400, "Email already in use");
      }

      // Create new user - password will be hashed by the pre-save middleware
      const user = await User.create({
        fullName: input.fullName,
        email: input.email,
        password: input.password,
        userType: input.userType,
        phoneNumber: input.phoneNumber,
      });

      console.log(`User registered successfully: ${user._id}`);

      // Generate JWT with safe access to _id
      const userId = user._id ? user._id.toString() : "";
      const token = signToken(userId);

      return {
        user: this.toDTO(user),
        token,
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      console.error("User registration error:", error);
      throw new HttpException(500, error.message || "Error creating user");
    }
  }

  public async login(input: LoginInput): Promise<AuthResponse> {
    try {
      console.log(`Login attempt for user: ${input.email}`);

      // Check for empty fields
      if (!input.email || !input.password) {
        console.log("Login failed: Missing required fields");
        throw new HttpException(400, "Email and password are required");
      }

      // Find user by email
      const user = await User.findOne({ email: input.email });
      if (!user) {
        console.log(`Login failed: No user found with email ${input.email}`);
        throw new HttpException(401, "Invalid credentials");
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(input.password);
      if (!isPasswordValid) {
        console.log(`Login failed: Invalid password for ${input.email}`);
        throw new HttpException(401, "Invalid credentials");
      }

      console.log(`User logged in successfully: ${user._id}`);

      // Generate JWT valid for 7 days with safe access to _id
      const userId = user._id ? user._id.toString() : "";
      const token = signToken(userId);

      return {
        user: this.toDTO(user),
        token,
      };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      console.error("Login error:", error);
      throw new HttpException(500, error.message || "Error during login");
    }
  }
}

export const authService = AuthService.getInstance();
