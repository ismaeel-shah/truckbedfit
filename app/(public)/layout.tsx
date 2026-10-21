import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { listCategories } from "@/lib/db/content";

// Navbar/footer categories come from D1 at request time.
export const dynamic = "force-dynamic";

async function getCategories() {
  try {
    return await listCategories();
  } catch {
    return [];
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  // Dropdown lists every category that has published posts (listCategories is name-sorted).
  const navCategories = categories
    .filter((c) => c.postCount > 0)
    .map(({ name, slug, icon, postCount }) => ({ name, slug, icon, postCount }));
  const footerCategories = categories.map(({ name, slug, icon }) => ({ name, slug, icon }));

  return (
    <>
      <Navbar categories={navCategories} />
      <main>{children}</main>
      <Footer categories={footerCategories} />
    </>
  );
}
