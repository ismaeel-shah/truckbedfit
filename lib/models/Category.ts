import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  postCount: number;
  metaTitle: string;
  metaDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name:            { type: String, required: true, trim: true },
    slug:            { type: String, required: true, unique: true, lowercase: true },
    description:     { type: String, default: "" },
    icon:            { type: String, default: "📁" },
    postCount:       { type: Number, default: 0 },
    metaTitle:       { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
