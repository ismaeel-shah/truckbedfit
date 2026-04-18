"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}
