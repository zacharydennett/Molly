"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { IllnessApiResponse } from "@/types/illness";

interface Props {
  wastewater: IllnessApiResponse["wastewater"];
}

export function WastewaterTrendChart({ wastewater }: Props) {
  const data = [
    { name: "Last Year", value: wastewater.sameWeekLastYear?.detectProp ?? 0 },
    { name: "Prev Week", value: wastewater.lastWeek?.detectProp ?? 0 },
    { name: "This Week", value: (wastewater.thisWeek ?? wastewater.lastWeek)?.detectProp ?? 0 },
  ];

  const colors = ["#94A3B8", "#93C5FD", "#0033A0"];

  if (data.every((d) => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-molly-slate">
        Wastewater data unavailable
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" hide />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 6 }}
          formatter={(v: number) => [`${v}%`, "Sites detecting"]}
        />
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
