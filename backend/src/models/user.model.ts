import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserType {
  ADMIN = "admin",
  CONSUMER = "consumer",
  FARMER = "farmer",
}

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  userType: UserType;
  phoneNumber: string;
  photoUrl?: string;
  photoData?: string; // Base64 encoded image data
  photoContentType?: string; // MIME type of the image
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    userType: {
      type: String,
      enum: Object.values(UserType),
      required: [true, "User type is required"],
      default: UserType.CONSUMER,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    photoData: {
      type: String, // Base64 encoded image data
    },
    photoContentType: {
      type: String, // MIME type of the image
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUserDocument>("User", userSchema);
