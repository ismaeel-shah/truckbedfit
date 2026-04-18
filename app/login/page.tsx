"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary dark:text-white">
            Work<span className="text-accent">Nest</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="admin@worknest.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link href="/login/forgot-password" className="text-xs text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Signing in…" : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
