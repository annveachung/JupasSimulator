"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import JupasHeader from "@/components/JupasHeader";

export default function CredentialsClient() {
  const params = useSearchParams();
  const username = params.get("u") ?? "";
  const password = params.get("p") ?? "";

  if (!username || !password) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f9fafb" }}>
        <JupasHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-sm text-gray-500">Invalid credentials page. Please submit your choices first.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f9fafb" }}>
      <JupasHeader />

      <main className="flex-1 flex items-start justify-center px-4 py-16">
        <div
          className="w-full max-w-lg rounded border p-8"
          style={{ backgroundColor: "#ffffff", borderColor: "#d1d5db" }}
        >
          {/* Success header */}
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: "#16a34a" }}
            >
              ✓
            </div>
            <h1 className="text-base font-bold text-gray-900">Choices Submitted Successfully</h1>
          </div>

          <p className="text-xs text-gray-600 mb-5 leading-relaxed">
            Your programme choices have been received. Please save your login credentials below.
            You will need them to access your results on results day.
          </p>

          {/* Credentials box */}
          <div
            className="rounded p-4 mb-4 font-mono text-sm"
            style={{
              backgroundColor: "#f5f5f5",
              borderLeft: "4px solid #1a2f5e",
              border: "1px solid #d1d5db",
              borderLeftWidth: "4px",
              borderLeftColor: "#1a2f5e",
            }}
          >
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-500 mr-4 w-40">Application Number</span>
              <span className="font-semibold text-gray-900 tracking-wide">{username}</span>
            </div>
            <div className="border-t my-2" style={{ borderColor: "#e5e7eb" }} />
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-500 mr-4 w-40">Password</span>
              <span className="font-semibold text-gray-900 tracking-wide">{password}</span>
            </div>
          </div>

          {/* Warning */}
          <div
            className="flex items-start gap-2 px-3 py-2 rounded text-xs mb-6"
            style={{
              backgroundColor: "#fef2f2",
              borderLeft: "4px solid #c0392b",
              color: "#c0392b",
            }}
          >
            <span className="mt-0.5">⚠</span>
            <span>
              These credentials will not be shown again. Please record them before proceeding.
            </span>
          </div>

          <Link
            href="/login"
            className="block w-full text-center py-2 px-4 text-sm font-medium text-white rounded"
            style={{ backgroundColor: "#1a2f5e" }}
          >
            Proceed to Login
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        JUPAS Results Simulator · For simulation purposes only
      </footer>
    </div>
  );
}
