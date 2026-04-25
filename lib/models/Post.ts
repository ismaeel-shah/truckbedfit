import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAffiliateProduct {
  name: string;
  amazonUrl: string;
  imageUrl: string;
  price: string;
  badge: string;
  pros: string[];
  cons: string[];
  order: number;
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  featuredImageAlt: string;
  category: mongoose.Types.ObjectId;
  tags: string[];
  status: "draft" | "published" | "scheduled";
  publishedAt: Date | null;
  scheduledAt: Date | null;
  views: number;
  readingTime: number;
  // SEO
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogImage: string;
  // Affiliate products
  affiliateProducts: IAffiliateProduct[];
  // FAQs
  faqs: IFAQ[];
  // Author
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateProductSchema = new Schema<IAffiliateProduct>(
  {
    name: { type: String, required: true },
    amazonUrl: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    price: { type: String, default: "" },
    badge: { type: String, default: "" },
    pros: [{ type: String }],
    cons: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    featuredImage: { type: String, default: "" },
    featuredImageAlt: { type: String, default: "" },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    publishedAt: { type: Date, default: null },
    scheduledAt: { type: Date, default: null },
    views: { type: Number, default: 0 },
    readingTime: { type: Number, default: 0 },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    focusKeyword: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    affiliateProducts: [AffiliateProductSchema],
    faqs: [
      {
        question: { type: String, default: "" },
        answer:   { type: String, default: "" },
        _id: false,
      },
    ],
    author: { type: Schema.Types.ObjectId, ref: "Author", default: null },
  },
  { timestamps: true }
);

PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ category: 1 });

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
