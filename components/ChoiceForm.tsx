"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgrammeAutocomplete from "./ProgrammeAutocomplete";
import type { Programme } from "@/data/programmes";

const BANDS = [
  { name: "A", label: "Band A — First Priority Choices", choices: [1, 2, 3] },
  { name: "B", label: "Band B — Second Priority Choices", choices: [4, 5, 6] },
  { name: "C", label: "Band C — Third Priority Choices", choices: [7, 8, 9, 10] },
  { name: "D", label: "Band D — Fourth Priority Choices", choices: [11, 12, 13, 14, 15] },
  { name: "E", label: "Band E — Fifth Priority Choices", choices: [16, 17, 18, 19, 20] },
];

export default function ChoiceForm() {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<number, Programme | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setChoice(rank: number, prog: Programme | null) {
    setSelections((prev) => ({ ...prev, [rank]: prog }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selections[1]) {
      setError("Choice 1 is required. Please search and select a programme for Choice 1.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const choices = Object.entries(selections)
      .filter(([, prog]) => prog !== null && prog !== undefined)
      .map(([rank, prog]) => ({ rank: Number(rank), jupasCode: (prog as Programme).code }));

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choices }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/credentials?u=${encodeURIComponent(data.username)}&p=${encodeURIComponent(data.password)}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {BANDS.map((band) => (
        <div key={band.name} className="mb-6">
          <div
            className="text-xs font-semibold uppercase tracking-widest py-1 px-3 mb-2"
            style={{
              borderLeft: "4px solid #1a2f5e",
              color: "#1a2f5e",
              backgroundColor: "#f0f4fb",
            }}
          >
            {band.label}
          </div>
          <div className="border rounded overflow-hidden" style={{ borderColor: "#d1d5db" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5" }}>
                  <th className="text-left px-3 py-2 w-12 text-gray-600 font-medium text-xs">No.</th>
                  <th className="text-left px-3 py-2 text-gray-600 font-medium text-xs">
                    Programme (search by name, JUPAS code, or university)
                  </th>
                </tr>
              </thead>
              <tbody>
                {band.choices.map((rank, i) => (
                  <tr
                    key={rank}
                    style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa" }}
                    className="border-t"
                  >
                    <td className="px-3 py-2 text-gray-500 text-xs align-middle whitespace-nowrap">
                      {rank}
                      {rank === 1 && (
                        <span className="text-red-600 ml-0.5">*</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <ProgrammeAutocomplete
                        rank={rank}
                        value={selections[rank] ?? null}
                        onChange={(prog) => setChoice(rank, prog)}
                        required={rank === 1}
                        disabled={submitting}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {error && (
        <div
          className="mb-4 px-4 py-3 text-sm rounded"
          style={{ backgroundColor: "#fef2f2", color: "#c0392b", border: "1px solid #fca5a5" }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-500">
          <span className="text-red-600">*</span> Choice 1 is required
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 text-sm font-medium text-white rounded disabled:opacity-60 flex items-center gap-2"
          style={{ backgroundColor: "#1a2f5e" }}
        >
          {submitting && (
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {submitting ? "Submitting…" : "Submit Choices"}
        </button>
      </div>
    </form>
  );
}
