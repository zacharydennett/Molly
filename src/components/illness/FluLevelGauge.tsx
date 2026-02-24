"use client";

import type { IllnessLevel } from "@/types/illness";

const LEVEL_CONFIG = {
  minimal: { color: "#22C55E", pct: 10 },
  low: { color: "#86EFAC", pct: 28 },
  moderate: { color: "#F59E0B", pct: 50 },
  high: { color: "#F97316", pct: 72 },
  very_high: { color: "#E8001C", pct: 90 },
  unknown: { color: "#94A3B8", pct: 0 },
};

interface Props {
  wili: number;
  level: IllnessLevel;
}

export function FluLevelGauge({ wili, level }: Props) {
  const config = LEVEL_CONFIG[level];
  const pct = Math.min((wili / 12) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {/* SVG Gauge */}
      <svg viewBox="0 0 120 70" className="w-48 h-auto">
        {/* Background arc */}
        <path
          d="M10 65 A50 50 0 0 1 110 65"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Colored zones */}
        {[
          { color: "#22C55E", start: 0, end: 0.2 },
          { color: "#86EFAC", start: 0.2, end: 0.42 },
          { color: "#F59E0B", start: 0.42, end: 0.62 },
          { color: "#F97316", start: 0.62, end: 0.82 },
          { color: "#E8001C", start: 0.82, end: 1 },
        ].map(({ color, start, end }) => {
          const r = 50;
          const cx = 60, cy = 65;
          const startAngle = Math.PI * (1 - start);
          const endAngle = Math.PI * (1 - end);
          const x1 = cx + r * Math.cos(startAngle);
          const y1 = cy - r * Math.sin(startAngle);
          const x2 = cx + r * Math.cos(endAngle);
          const y2 = cy - r * Math.sin(endAngle);
          return (
            <path
              key={color}
              d={`M${x1} ${y1} A${r} ${r} 0 0 0 ${x2} ${y2}`}
              fill="none"
              stroke={color}
              strokeWidth="10"
              opacity="0.3"
            />
          );
        })}
        {/* Needle */}
        {(() => {
          const angle = Math.PI * (1 - pct / 100);
          const nx = 60 + 42 * Math.cos(angle);
          const ny = 65 - 42 * Math.sin(angle);
          return (
            <>
              <line
                x1="60"
                y1="65"
                x2={nx}
                y2={ny}
                stroke={config.color}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="60" cy="65" r="4" fill={config.color} />
            </>
          );
        })()}
        {/* Center text */}
        <text
          x="60"
          y="58"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#0F172A"
          fontFamily="monospace"
        >
          {wili.toFixed(1)}%
        </text>
        <text x="60" y="68" textAnchor="middle" fontSize="6" fill="#64748B" fontFamily="sans-serif">
          National ILI
        </text>
        {/* Scale labels */}
        <text x="10" y="72" fontSize="5" fill="#94A3B8" textAnchor="middle">0%</text>
        <text x="110" y="72" fontSize="5" fill="#94A3B8" textAnchor="middle">12%</text>
      </svg>
    </div>
  );
}
