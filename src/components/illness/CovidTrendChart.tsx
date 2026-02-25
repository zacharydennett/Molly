"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { IllnessApiResponse } from "@/types/illness";

interface Props {
  wastewater: IllnessApiResponse["wastewater"];
}

export function WastewaterTrendChart({ wastewater }: Props) {
  // Show last 6 weeks of national WVAL + LY national as a mini sparkline
  const data = wastewater.trendSeries.slice(-6).map((pt) => ({
    name: pt.weekLabel,
    wval: pt.national,
    wvalLY: pt.nationalLY,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-molly-slate">
        Wastewater data unavailable
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <XAxis dataKey="name" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} hide />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 6 }}
          formatter={(v: number, name: string) => [
            v?.toFixed(1),
            name === "wval" ? "WVAL (this year)" : "WVAL (last year)",
          ]}
        />
        <Line
          type="monotone"
          dataKey="wval"
          stroke="#F97316"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="wvalLY"
          stroke="#94A3B8"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
