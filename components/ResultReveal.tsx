"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface AdmittedChoice {
  rank: number;
  band: string;
  jupasCode: string;
  university: string;
  program: string;
}

interface Props {
  admittedChoice: AdmittedChoice;
  onReset: () => void;
  resetting: boolean;
}

const STATUS_MESSAGES = [
  "Connecting to JUPAS server…",
  "Authenticating…",
  "Retrieving offer data…",
  "Finalising…",
];

const BAND_THEME: Record<string, { border: string; header: string; text: string; label: string }> = {
  A: { border: "#16a34a", header: "#f0fdf4", text: "#15803d", label: "CONGRATULATIONS" },
  B: { border: "#16a34a", header: "#f0fdf4", text: "#15803d", label: "CONGRATULATIONS" },
  C: { border: "#1a2f5e", header: "#eff6ff", text: "#1a2f5e", label: "Offer Result" },
  D: { border: "#d97706", header: "#fffbeb", text: "#92400e", label: "Offer Result" },
  E: { border: "#d97706", header: "#fffbeb", text: "#92400e", label: "Offer Result" },
};

export default function ResultReveal({ admittedChoice, onReset, resetting }: Props) {
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const confettiFired = useRef(false);

  // Loading phase
  useEffect(() => {
    if (phase !== "loading") return;
    confettiFired.current = false;

    const duration = 4000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => setPhase("reveal"), 300);
      }
    };
    requestAnimationFrame(tick);

    const msgInterval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1000);

    return () => clearInterval(msgInterval);
  }, [phase]);

  // Confetti on reveal for Band A/B
  useEffect(() => {
    if (phase === "reveal" && !confettiFired.current && ["A", "B"].includes(admittedChoice.band)) {
      confettiFired.current = true;
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }
  }, [phase, admittedChoice.band]);

  // Reset restarts loading phase
  function handleReset() {
    setPhase("loading");
    setProgress(0);
    setMsgIndex(0);
    onReset();
  }

  const theme = BAND_THEME[admittedChoice.band] ?? BAND_THEME.C;

  return (
    <AnimatePresence mode="wait">
      {phase === "loading" ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="py-16 flex flex-col items-center gap-8"
        >
          <p className="text-gray-700 text-sm font-medium">Retrieving your results from JUPAS…</p>

          <div className="w-full max-w-md">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={msgIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  {STATUS_MESSAGES[msgIndex]}
                </motion.span>
              </AnimatePresence>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#e5e7eb" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: "#1a2f5e" }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">Please wait. Do not close this page.</p>
        </motion.div>
      ) : (
        <motion.div
          key={`reveal-${admittedChoice.rank}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Result card */}
          <div
            className="rounded-lg overflow-hidden shadow-md mb-6"
            style={{ border: `2px solid ${theme.border}` }}
          >
            <div
              className="px-6 py-4"
              style={{ backgroundColor: theme.header, borderBottom: `1px solid ${theme.border}` }}
            >
              <h2 className="text-lg font-bold" style={{ color: theme.text }}>
                {theme.label}
              </h2>
            </div>

            <div className="px-6 py-6 bg-white">
              <p className="text-sm text-gray-600 mb-4">
                {["A", "B"].includes(admittedChoice.band)
                  ? "You have been offered a place in the following programme:"
                  : "You have been offered a place in the following programme:"}
              </p>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded font-semibold"
                    style={{ backgroundColor: "#e8edf5", color: "#1a2f5e" }}
                  >
                    {admittedChoice.jupasCode}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded font-semibold"
                    style={{ backgroundColor: theme.header, color: theme.text, border: `1px solid ${theme.border}` }}
                  >
                    Band {admittedChoice.band} — Choice {admittedChoice.rank}
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900 mt-3">{admittedChoice.university}</p>
                <p className="text-sm text-gray-700">{admittedChoice.program}</p>
              </div>
            </div>
          </div>

          {/* Re-roll button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              style={{ borderColor: "#d1d5db" }}
            >
              {resetting && (
                <svg className="animate-spin h-3.5 w-3.5 text-gray-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              Re-roll Result
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
