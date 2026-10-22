import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getNavData, NavData } from "@/lib/db/content";

// Navbar/footer menus come from D1 at request time.
export const dynamic = "force-dynamic";

const EMPTY_NAV: NavData = { categories: [], trucks: [] };

async function loadNav(): Promise<NavData> {
  try {
    return await getNavData();
  } catch {
    return EMPTY_NAV;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Visibility rule: menus only link to categories and trucks that have a published article.
  const nav = await loadNav();

  return (
    <>
      <Navbar nav={nav} />
      <main>{children}</main>
      <Footer categories={nav.categories} showTrucks={nav.trucks.length > 0} />
    </>
  );
}
