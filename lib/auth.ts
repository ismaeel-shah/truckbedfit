import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getD1, UserRow } from "./db/d1";

export type SessionUser = Pick<UserRow, "id" | "name" | "email" | "role">;

/**
 * Returns the signed-in user, re-read from D1 so role changes and deleted
 * accounts take effect immediately instead of when the JWT expires.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;

  return getD1()
    .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
    .bind(id)
    .first<SessionUser>();
}

type AuthResult =
  | { user: SessionUser; response: null }
  | { user: null; response: NextResponse };

/** Guard for API routes: `const { user, response } = await requireUser(); if (response) return response;` */
export async function requireUser(role?: "admin"): Promise<AuthResult> {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (role === "admin" && user.role !== "admin") {
    return { user: null, response: NextResponse.json({ error: "Admins only" }, { status: 403 }) };
  }
  return { user, response: null };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = getD1();
        const user = await db
          .prepare("SELECT * FROM users WHERE email = ?")
          .bind(credentials.email.toLowerCase().trim())
          .first<UserRow>();
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
