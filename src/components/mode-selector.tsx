"use client";

import type { Dispatch, SetStateAction } from "react";

type Mode = "electrical" | "training";

const MODES: Record<Mode, { label: string; description: string }> = {
  electrical: {
    label: "🔧 Masalah Elektrikal",
    description: "Panduan keselamatan & rujukan ST",
  },
  training: {
    label: "🎓 Tentang Kursus",
    description: "Info PW2, PW4 & laluan SKM",
  },
};

interface ModeSelectorProps {
  value: Mode;
  onChange: Dispatch<SetStateAction<Mode>>;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(Object.keys(MODES) as Mode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`rounded-2xl border px-4 py-4 text-left transition ${
            value === mode
              ? "border-black/10 bg-black text-white"
              : "border-black/10 bg-white text-black hover:bg-black/5"
          }`}
        >
          <p className="text-sm font-semibold">{MODES[mode].label}</p>
          <p className={`text-xs ${value === mode ? "text-white/80" : "text-slate-500"}`}>
            {MODES[mode].description}
          </p>
        </button>
      ))}
    </div>
  );
}

export type { Mode };
