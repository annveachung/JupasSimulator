"use client";

import { useState } from "react";

interface Choice {
  rank: number;
  jupasCode: string;
  university: string;
  program: string;
  band: string;
}

interface Props {
  choices: Choice[];
  admittedRank: number;
}

const BAND_RANGES: Record<string, string> = {
  A: "Choices 1–3",
  B: "Choices 4–6",
  C: "Choices 7–10",
  D: "Choices 11–15",
  E: "Choices 16–20",
};

export default function ChoiceTable({ choices, admittedRank }: Props) {
  const [open, setOpen] = useState(false);

  const byBand: Record<string, Choice[]> = {};
  for (const c of choices) {
    if (!byBand[c.band]) byBand[c.band] = [];
    byBand[c.band].push(c);
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <span>{open ? "▼" : "▶"}</span>
        <span>{open ? "Hide" : "View"} all submitted choices</span>
      </button>

      {open && (
        <div className="mt-3 border rounded overflow-hidden" style={{ borderColor: "#d1d5db" }}>
          {["A", "B", "C", "D", "E"].map((band) => {
            const bandChoices = byBand[band];
            if (!bandChoices?.length) return null;
            return (
              <div key={band}>
                <div
                  className="text-xs font-semibold uppercase tracking-widest px-3 py-1"
                  style={{ backgroundColor: "#f0f4fb", color: "#1a2f5e", borderLeft: "3px solid #1a2f5e" }}
                >
                  Band {band} — {BAND_RANGES[band]}
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    {bandChoices.map((c, i) => {
                      const isAdmitted = c.rank === admittedRank;
                      return (
                        <tr
                          key={c.rank}
                          style={{
                            backgroundColor: isAdmitted
                              ? "#f0fdf4"
                              : i % 2 === 0
                              ? "#ffffff"
                              : "#fafafa",
                            borderTop: "1px solid #f3f4f6",
                          }}
                        >
                          <td className="px-3 py-2 w-8 text-gray-500">{c.rank}</td>
                          <td
                            className="px-2 py-2 font-mono font-medium w-20"
                            style={{ color: "#1a2f5e" }}
                          >
                            {c.jupasCode}
                          </td>
                          <td className="px-2 py-2 text-gray-600 w-48 truncate max-w-[180px]" title={c.university}>
                            {c.university}
                          </td>
                          <td className="px-2 py-2 text-gray-900 flex-1" title={c.program}>
                            {c.program}
                          </td>
                          <td className="px-3 py-2 w-8 text-green-600 font-bold">
                            {isAdmitted ? "✓" : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
