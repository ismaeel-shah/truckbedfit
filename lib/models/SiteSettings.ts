import mongoose, { Schema, Model } from "mongoose";

export interface ISiteSetting {
  key: string;
  value: Record<string, string>;
}

const SiteSettingsSchema = new Schema<ISiteSetting>(
  {
    key:   { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSetting> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSetting>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
