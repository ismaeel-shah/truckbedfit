"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [invalid, setInvalid]     = useState(false);

  useEffect(() => {
    if (!token) setInvalid(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    if (password.length < 6)  { toast.error("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const err = await res.json();
        if (err.error === "Invalid or expired link") setInvalid(true);
        else toast.error(err.error ?? "Something went wrong");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary">
            Work<span className="text-accent">Nest</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Admin dashboard</p>
        </div>

        <div className="card p-8">
          {invalid ? (
            <div className="text-center space-y-4">
              <XCircle size={48} className="text-red-400 mx-auto" />
              <h2 className="font-heading font-bold text-xl text-primary">Link expired</h2>
              <p className="text-sm text-slate-500">This reset link is invalid or has expired.</p>
              <Link href="/login/forgot-password" className="btn-primary inline-flex">
                Request a new link
              </Link>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="text-green-500 mx-auto" />
              <h2 className="font-heading font-bold text-xl text-primary">Password updated!</h2>
              <p className="text-sm text-slate-500">Redirecting to login…</p>
            </div>
          ) : (
            <>
              <h2 className="font-heading font-bold text-xl text-primary mb-1">Set new password</h2>
              <p className="text-sm text-slate-500 mb-6">Choose a strong password (min 6 characters).</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-60"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
