import { Request, Response, NextFunction } from "express";
import { User, IUserDocument } from "../models/user.model";
import { HttpException } from "../middlewares/error.middleware";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

// Extend Express Request to include user property
interface AuthRequest extends Request {
  user?: IUserDocument;
  processedImage?: {
    data: string;
    contentType: string;
  };
}

/**
 * Generate a photo URL for a user
 * @param userId - The user ID
 * @returns Properly formatted photo URL
 */
const generatePhotoUrl = (userId: string): string => {
  // Create a unique identifier based on user ID and timestamp for cache busting
  const identifier = crypto
    .createHash("md5")
    .update(`${userId}-${new Date().getTime()}`)
    .digest("hex");
  return `/api/users/photo/${userId}?v=${identifier}`;
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Get the userId as string
    const userId = user._id ? user._id.toString() : "";

    // Use stored photoUrl if available, otherwise generate if user has photo data
    const photoUrl =
      user.photoUrl ||
      (user.photoData && user.photoContentType ? generatePhotoUrl(userId) : "");

    res.status(200).json({
      success: true,
      data: {
        id: userId,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        photoUrl: photoUrl,
        role: user.userType,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile photo
 * @route   GET /api/users/photo/:userId
 * @access  Public (but could be restricted if needed)
 */
export const getProfilePhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user || !user.photoData || !user.photoContentType) {
      throw new HttpException(404, "Photo not found");
    }

    // Set content type and send base64 data
    res.set("Content-Type", user.photoContentType);

    // Convert base64 to buffer and send
    const imageBuffer = Buffer.from(user.photoData, "base64");
    res.send(imageBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullName, phoneNumber, email } = req.body;
    const user = req.user;

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Get the userId as string
    const userId = user._id ? user._id.toString() : "";

    // Check if email already exists for another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email,
        _id: { $ne: new mongoose.Types.ObjectId(userId) },
      });
      if (emailExists) {
        throw new HttpException(400, "Email is already taken");
      }
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;

    // Save updated user
    const updatedUser = await user.save();
    const updatedUserId = updatedUser._id ? updatedUser._id.toString() : "";

    // Use stored photoUrl if available, otherwise generate if user has photo data
    const photoUrl =
      updatedUser.photoUrl ||
      (updatedUser.photoData && updatedUser.photoContentType
        ? generatePhotoUrl(updatedUserId)
        : "");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUserId,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        email: updatedUser.email,
        photoUrl: photoUrl,
        role: updatedUser.userType,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile photo
 * @route   POST /api/users/upload-photo
 * @access  Private
 */
export const uploadPhoto = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (!req.processedImage) {
      throw new HttpException(400, "No image data found");
    }

    // Get the userId as string
    const userId = user._id ? user._id.toString() : "";

    // Update user with base64 image data
    user.photoData = req.processedImage.data;
    user.photoContentType = req.processedImage.contentType;

    // Generate and store photo URL
    const photoUrl = generatePhotoUrl(userId);
    user.photoUrl = photoUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        photoUrl: photoUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   POST /api/users/change-password
 * @access  Private
 */
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      throw new HttpException(
        400,
        "Both current and new password are required"
      );
    }

    if (newPassword.length < 6) {
      throw new HttpException(
        400,
        "New password must be at least 6 characters long"
      );
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new HttpException(401, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
