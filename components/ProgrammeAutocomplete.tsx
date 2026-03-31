"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Programme } from "@/data/programmes";

interface Props {
  rank: number;
  value: Programme | null;
  onChange: (prog: Programme | null) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function ProgrammeAutocomplete({ rank, value, onChange, required, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Programme[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/programmes/search?q=${encodeURIComponent(q)}`);
      const data: Programme[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
      setActiveIndex(-1);
    }, 200);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  function select(prog: Programme) {
    onChange(prog);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function clear() {
    onChange(null);
    setQuery("");
    setResults([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 w-full">
        <span
          className="font-mono text-xs px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "#e8edf5", color: "#1a2f5e" }}
        >
          {value.code}
        </span>
        <span className="text-xs text-gray-500 truncate max-w-[160px]" title={value.university}>
          {value.university}
        </span>
        <span className="text-xs text-gray-900 truncate flex-1" title={value.name}>
          {value.name}
        </span>
        {!disabled && (
          <button
            type="button"
            onClick={clear}
            className="text-gray-400 hover:text-red-500 text-xs ml-auto flex-shrink-0"
            aria-label="Clear selection"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => query && results.length > 0 && setOpen(true)}
        placeholder={required ? "Search programme (required)…" : "Search programme…"}
        disabled={disabled}
        className="w-full text-xs border rounded px-2 py-1 outline-none focus:border-blue-500 disabled:bg-gray-50"
        style={{ borderColor: "#d1d5db" }}
        aria-label={`Choice ${rank} programme search`}
        autoComplete="off"
      />
      {open && (
        <ul
          ref={listRef}
          className="absolute z-50 left-0 right-0 bg-white border rounded shadow-lg max-h-64 overflow-y-auto"
          style={{ borderColor: "#d1d5db", top: "calc(100% + 2px)" }}
        >
          {results.map((prog, i) => (
            <li
              key={prog.code}
              onMouseDown={() => select(prog)}
              className="px-3 py-2 cursor-pointer border-b last:border-b-0 hover:bg-blue-50"
              style={{
                borderColor: "#f3f4f6",
                backgroundColor: i === activeIndex ? "#eff6ff" : undefined,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-xs font-medium"
                  style={{ color: "#1a2f5e" }}
                >
                  {prog.code}
                </span>
                <span className="text-xs text-gray-500 truncate">{prog.university}</span>
              </div>
              <div className="text-xs text-gray-900 mt-0.5 leading-tight">{prog.name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
