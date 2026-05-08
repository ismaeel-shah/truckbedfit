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
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="38" height="38" rx="10" fill="url(#loginGrad)"/>
              <rect x="9" y="8" width="15" height="11" rx="2.5" fill="white" opacity="0.95"/>
              <rect x="10.5" y="9.5" width="12" height="8" rx="1.5" fill="#0D1520" opacity="0.3"/>
              <rect x="15" y="19" width="3" height="2.5" rx="1" fill="white" opacity="0.85"/>
              <rect x="4" y="21.5" width="30" height="3" rx="1.5" fill="white"/>
              <rect x="25" y="16" width="5" height="5.5" rx="2.5" fill="white" opacity="0.8"/>
              <rect x="30" y="17.5" width="2" height="2.5" rx="1" fill="white" opacity="0.6"/>
              <rect x="7" y="24.5" width="2.5" height="5" rx="1.25" fill="white" opacity="0.65"/>
              <rect x="28.5" y="24.5" width="2.5" height="5" rx="1.25" fill="white" opacity="0.65"/>
              <defs>
                <linearGradient id="loginGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1B2A3B"/>
                  <stop offset="100%" stopColor="#2DD4BF"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col leading-none text-left">
              <span className="font-heading font-bold text-[18px] text-primary tracking-tight">
                Home<span className="text-accent">Desk</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-[0.2em] uppercase">
                Essentials
              </span>
            </div>
          </div>
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
              placeholder="admin@homedeskessentials.com"
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
