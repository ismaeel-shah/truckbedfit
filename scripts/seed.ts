import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set in .env.local");
  process.exit(1);
}

// ─── Inline schemas (avoid circular imports in script context) ────────────────
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    icon: String,
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

// ─── Seed data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Ergonomic Chairs", slug: "ergonomic-chairs", icon: "🪑", description: "Best ergonomic chairs for posture, comfort, and long work sessions." },
  { name: "Desks & Workstations", slug: "desks-workstations", icon: "🗂️", description: "Standing desks, L-shaped desks, and small-space solutions." },
  { name: "Monitors & Displays", slug: "monitors-displays", icon: "🖥️", description: "Ultrawide, 4K, and curved monitors for every home office setup." },
  { name: "Keyboards & Mice", slug: "keyboards-mice", icon: "⌨️", description: "Mechanical keyboards, wireless mice, and ergonomic combos." },
  { name: "Lighting & Webcams", slug: "lighting-webcams", icon: "💡", description: "Ring lights, key lights, and the best webcams for video calls." },
  { name: "Headphones & Audio", slug: "headphones-audio", icon: "🎧", description: "Noise-cancelling headphones, desk speakers, and microphones." },
  { name: "Networking", slug: "networking", icon: "🌐", description: "Wi-Fi routers and mesh networks for a rock-solid home office connection." },
  { name: "Cables & Accessories",        slug: "cables-accessories",        icon: "🔌", description: "Desk organizers, cable management, monitor arms, and more." },
  { name: "Storage & Organization",      slug: "storage-organization",      icon: "🗄️", description: "Filing cabinets, desk organizers, shelving, and storage solutions for a tidy workspace." },
  { name: "Printer & Scanning",          slug: "printer-scanning",          icon: "🖨️", description: "Home office printers, scanners, and all-in-one devices for every budget." },
  { name: "Power & Surge Protection",    slug: "power-surge-protection",    icon: "⚡", description: "Surge protectors, UPS units, and power strips to keep your setup safe and powered." },
  { name: "Notebooks & Stationery",      slug: "notebooks-stationery",      icon: "📓", description: "Notebooks, planners, pens, and desk stationery for the analog side of productivity." },
  { name: "Standing Desk Accessories",   slug: "standing-desk-accessories", icon: "🧍", description: "Anti-fatigue mats, monitor arms, cable trays, and everything for your standing desk." },
  { name: "Bags & Cases",                slug: "bags-cases",                icon: "💼", description: "Laptop bags, backpacks, and carrying cases for the modern remote worker." },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ Connected to MongoDB");

  // Admin user
  const existingUser = await User.findOne({ email: "admin@worknest.com" });
  if (!existingUser) {
    const hashed = await bcrypt.hash("admin123", 12);
    await User.create({ name: "Admin", email: "admin@worknest.com", password: hashed, role: "admin" });
    console.log("✅ Admin user created — admin@worknest.com / admin123");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // Categories
  for (const cat of CATEGORIES) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      await Category.create(cat);
      console.log(`✅ Category created: ${cat.icon} ${cat.name}`);
    } else {
      console.log(`ℹ️  Category exists: ${cat.name}`);
    }
  }

  console.log("\n🎉 Seed complete!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
