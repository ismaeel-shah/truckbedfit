"use client";

import { SessionProvider } from "next-auth/react";

/**
 * NextAuth session context for the dashboard only. Public pages don't use it, so they skip the
 * /api/auth/session request that SessionProvider makes on every page load.
 */
export default function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
