import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { listLiveCategories } from "@/lib/db/content";

// Navbar/footer categories come from D1 at request time.
export const dynamic = "force-dynamic";

async function getLiveCategories() {
  try {
    return await listLiveCategories();
  } catch {
    return [];
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Visibility rule: menus only link to categories that have a published article.
  const categories = await getLiveCategories();
  const navCategories = categories.map(({ name, slug, icon, postCount }) => ({ name, slug, icon, postCount }));
  const footerCategories = categories.map(({ name, slug, icon }) => ({ name, slug, icon }));

  return (
    <>
      <Navbar categories={navCategories} />
      <main>{children}</main>
      <Footer categories={footerCategories} />
    </>
  );
}
