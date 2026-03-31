"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JupasHeader from "@/components/JupasHeader";
import ResultReveal from "@/components/ResultReveal";
import ChoiceTable from "@/components/ChoiceTable";

interface Choice {
  rank: number;
  jupasCode: string;
  university: string;
  program: string;
  band: string;
}

interface AdmittedChoice extends Choice {}

interface ResultData {
  admittedChoiceRank: number;
  admittedChoice: AdmittedChoice;
  resetCount: number;
  choices: Choice[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  async function fetchResults() {
    const res = await fetch("/api/results");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) return;
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    fetchResults();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleReset() {
    setResetting(true);
    const res = await fetch("/api/results/reset", { method: "POST" });
    if (res.status === 401) { router.push("/login"); return; }
    if (res.ok) {
      const json = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              admittedChoiceRank: json.admittedChoiceRank,
              admittedChoice: json.admittedChoice,
              resetCount: json.resetCount,
            }
          : prev
      );
    }
    setResetting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f9fafb" }}>
        <JupasHeader showLogout />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading…</p>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f9fafb" }}>
        <JupasHeader showLogout />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-red-500">Failed to load results. Please try again.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f9fafb" }}>
      <JupasHeader showLogout />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-400 mb-4">
          JUPAS 2026 &rsaquo; Applicant Portal &rsaquo; Results
        </div>

        <h1 className="text-base font-bold text-gray-900 mb-6">
          2026 Admission Results
        </h1>

        <ResultReveal
          admittedChoice={data.admittedChoice}
          onReset={handleReset}
          resetting={resetting}
        />

        <ChoiceTable choices={data.choices} admittedRank={data.admittedChoiceRank} />
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        JUPAS Results Simulator · For simulation purposes only
      </footer>
    </div>
  );
}
