/**
 * app/portal/login/page.tsx — Customer Login
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      if (data.redirect) {
        router.push(data.redirect);
      } else {
        setMessage("If an account was found, you've been signed in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setCodeLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/portal/${code.trim().toUpperCase()}`);
      if (res.status === 404) throw new Error("Reservation not found. Check your code and try again.");
      if (!res.ok) throw new Error("Unable to look up reservation.");
      router.push(`/portal/${code.trim().toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCodeLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2952CC] flex items-center justify-center">
              <span className="text-white text-xs font-black">SS</span>
            </div>
            <span className="font-bold text-gray-900">SureShift</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to site</Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Customer Portal</h1>
            <p className="text-gray-500">Sign in to view your rental and manage your reservation.</p>
          </div>

          {/* Email login */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-4">Sign in with email</h2>
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#2952CC] placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#3561e0] transition-colors text-sm disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            {message && <p className="text-emerald-600 text-sm mt-3">{message}</p>}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Reservation code */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-1">Look up by reservation code</h2>
            <p className="text-gray-500 text-sm mb-4">Find your code in your confirmation email.</p>
            <form onSubmit={handleCodeLookup} className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SS-12345"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#2952CC] placeholder-gray-400 uppercase"
              />
              <button
                type="submit"
                disabled={codeLoading || !code.trim()}
                className="px-4 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 whitespace-nowrap"
              >
                {codeLoading ? "..." : "Look Up"}
              </button>
            </form>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <p className="text-center text-gray-400 text-xs mt-6">
            Don&apos;t have a reservation?{" "}
            <Link href="/fleet" className="text-[#2952CC] hover:underline font-medium">Browse our fleet →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
