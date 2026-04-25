import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuthor extends Document {
  name: string;
  slug: string;
  bio?: string;
  photo?: string;
  twitter?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name:    { type: String, required: true, trim: true },
    slug:    { type: String, required: true, unique: true, lowercase: true },
    bio:     { type: String, default: "" },
    photo:   { type: String, default: "" },
    twitter: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  { timestamps: true }
);

AuthorSchema.index({ slug: 1 });

const Author: Model<IAuthor> =
  mongoose.models.Author || mongoose.model<IAuthor>("Author", AuthorSchema);

export default Author;
