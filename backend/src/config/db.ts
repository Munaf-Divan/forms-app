import mongoose from "mongoose";
import { config } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);

    // Log successful connection
    console.log("✅ Connected to MongoDB Atlas");

    // Optional: Log database name if connection is established
    if (mongoose.connection.db) {
      console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
    }
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};
