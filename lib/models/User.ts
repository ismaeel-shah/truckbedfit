import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "editor";
  bio?: string;
  photo?: string;
  twitter?: string;
  website?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role:              { type: String, enum: ["admin", "editor"], default: "admin" },
    bio:               { type: String, default: "" },
    photo:             { type: String, default: "" },
    twitter:           { type: String, default: "" },
    website:           { type: String, default: "" },
    resetToken:        { type: String, default: null },
    resetTokenExpiry:  { type: Date,   default: null },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
