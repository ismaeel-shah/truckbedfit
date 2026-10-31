"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

// The NextAuth SessionProvider lives in the dashboard layout (components/dashboard/AuthSessionProvider),
// so public pages don't fetch /api/auth/session.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: "var(--font-dm-sans)" },
        }}
      />
    </ThemeProvider>
  );
}
