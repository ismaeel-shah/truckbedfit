import AuthSessionProvider from "@/components/dashboard/AuthSessionProvider";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SITE_NAME } from "@/lib/site";

export const metadata = {
  title: { default: "Dashboard", template: `%s | ${SITE_NAME} Admin` },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthSessionProvider>
  );
}
