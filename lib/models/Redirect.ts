import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRedirect extends Document {
  source: string;
  destination: string;
  type: 301 | 302;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RedirectSchema = new Schema<IRedirect>(
  {
    source:      { type: String, required: true, unique: true, trim: true },
    destination: { type: String, required: true, trim: true },
    type:        { type: Number, enum: [301, 302], default: 301 },
    active:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Redirect: Model<IRedirect> =
  mongoose.models.Redirect ||
  mongoose.model<IRedirect>("Redirect", RedirectSchema);

export default Redirect;
