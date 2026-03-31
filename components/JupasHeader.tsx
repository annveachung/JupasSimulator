"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  showLogout?: boolean;
}

export default function JupasHeader({ showLogout = false }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header style={{ backgroundColor: "#1a2f5e" }} className="text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold tracking-wide">JUPAS</div>
          <div className="text-xs text-blue-200 leading-tight">
            Joint University Programmes Admissions System
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-blue-800 px-2 py-1 rounded font-medium">
            2026 Admissions
          </span>
          {showLogout && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-xs text-blue-200 hover:text-white underline disabled:opacity-50"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
