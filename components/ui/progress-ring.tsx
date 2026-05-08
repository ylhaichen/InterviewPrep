"use client";

import { motion } from "framer-motion";

export function ProgressRing({ value, label }: { value: number; label: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="88" height="88" viewBox="0 0 88 88" className="drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="8" />
        <motion.circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          transform="rotate(-90 44 44)"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <text x="44" y="48" textAnchor="middle" className="fill-slate-100 text-sm font-semibold">
          {Math.round(progress)}%
        </text>
      </svg>
      <span className="text-xs text-slate-300">{label}</span>
    </div>
  );
}
