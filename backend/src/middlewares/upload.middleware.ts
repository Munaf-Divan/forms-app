import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { HttpException } from "./error.middleware";
import { promisify } from "util";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage for processing files before database storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only images
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new HttpException(400, "Only image files are allowed"));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Middleware to process uploaded image to Base64 for database storage
 */
export const processImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new HttpException(400, "No image file uploaded"));
    }

    // Get the uploaded file from multer's memory storage
    const imageFile = req.file;

    // Convert the buffer to Base64 string
    const base64Image = imageFile.buffer.toString("base64");

    // Add the processed data to the request for controller use
    req.processedImage = {
      data: base64Image,
      contentType: imageFile.mimetype,
    };

    next();
  } catch (error) {
    next(new HttpException(500, "Error processing uploaded image"));
  }
};

// Add property to Request interface
declare global {
  namespace Express {
    interface Request {
      processedImage?: {
        data: string;
        contentType: string;
      };
    }
  }
}
