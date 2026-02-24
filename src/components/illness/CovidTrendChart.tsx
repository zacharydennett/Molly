"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { IllnessApiResponse } from "@/types/illness";

interface Props {
  covid: IllnessApiResponse["covid"];
}

export function CovidTrendChart({ covid }: Props) {
  const data = [
    { name: "Last Year", value: covid.sameWeekLastYear?.weeklyAdmissions ?? 0 },
    { name: "Prev Week", value: covid.lastWeek?.weeklyAdmissions ?? 0 },
    { name: "Last Week", value: covid.thisWeek?.weeklyAdmissions ?? covid.lastWeek?.weeklyAdmissions ?? 0 },
  ];

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const colors = ["#94A3B8", "#93C5FD", "#0033A0"];

  if (data.every((d) => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-molly-slate">
        COVID data unavailable
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} domain={[0, maxVal * 1.2]} hide />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 6 }}
          formatter={(v: number) => [v.toLocaleString(), "Admissions"]}
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
