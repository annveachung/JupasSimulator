"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JupasHeader from "@/components/JupasHeader";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter your application number and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/results");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f9fafb" }}>
      <JupasHeader />

      <main className="flex-1 flex items-start justify-center px-4 py-16">
        <div
          className="w-full max-w-sm rounded border p-8 shadow-sm"
          style={{ backgroundColor: "#ffffff", borderColor: "#d1d5db" }}
        >
          <h1 className="text-base font-bold text-gray-900 mb-1">JUPAS Applicant Login</h1>
          <p className="text-xs text-gray-500 mb-6">
            Enter your application number and password to view your results.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Application Number
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. 26-12345"
                disabled={loading}
                className="w-full text-sm border rounded px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-50"
                style={{ borderColor: "#d1d5db" }}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full text-sm border rounded px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-50"
                style={{ borderColor: "#d1d5db" }}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="px-3 py-2 rounded text-xs"
                style={{ backgroundColor: "#fef2f2", color: "#c0392b", border: "1px solid #fca5a5" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-sm font-medium text-white rounded disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#1a2f5e" }}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t text-xs text-gray-500" style={{ borderColor: "#e5e7eb" }}>
            Don&apos;t have an account?{" "}
            <Link href="/" className="underline hover:text-gray-700">
              Submit your choices →
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        JUPAS Results Simulator · For simulation purposes only
      </footer>
    </div>
  );
}
