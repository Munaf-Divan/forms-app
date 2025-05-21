import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post("/signup", authController.signup.bind(authController));

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post("/login", authController.login.bind(authController));

export default router;
