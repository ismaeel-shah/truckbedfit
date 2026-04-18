import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected");

  const result = await User.findOneAndUpdate(
    { email: "admin@worknest.com" },
    { email: "ismaeilkhan90@gmail.com" },
    { new: true }
  );

  if (result) {
    console.log(`✅ Admin email updated to: ${result.email}`);
  } else {
    console.log("❌ Admin user not found");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
