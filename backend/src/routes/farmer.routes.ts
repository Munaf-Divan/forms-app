import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { upload, processImageUpload } from "../middlewares/upload.middleware";
import {
  getProfile,
  getProfilePhoto,
  updateProfile,
  uploadPhoto,
  changePassword,
} from "../controllers/farmer.controller";

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", protect, getProfile);

/**
 * @route   GET /api/users/photo/:userId
 * @desc    Get user profile photo
 * @access  Public
 */
router.get("/photo/:userId", getProfilePhoto);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", protect, updateProfile);

/**
 * @route   POST /api/users/upload-photo
 * @desc    Upload profile photo
 * @access  Private
 */
router.post(
  "/upload-photo",
  protect,
  upload.single("photo"),
  processImageUpload,
  uploadPhoto
);

/**
 * @route   POST /api/users/change-password
 * @desc    Change password
 * @access  Private
 */
router.post("/change-password", protect, changePassword);

export default router;
