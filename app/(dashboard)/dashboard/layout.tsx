import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata = { title: { default: "Dashboard", template: "%s | WorkNest Admin" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
