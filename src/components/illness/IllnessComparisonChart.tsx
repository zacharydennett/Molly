"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { IllnessApiResponse } from "@/types/illness";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface Props {
  flu: IllnessApiResponse["flu"];
  wastewater: IllnessApiResponse["wastewater"];
}

export function IllnessComparisonChart({ flu, wastewater }: Props) {
  const fluData = [
    {
      name: "Wk -52 (LY)",
      "Flu ILI%": flu.sameWeekLastYear?.wili ?? null,
      label: flu.sameWeekLastYear?.weekLabel,
    },
    {
      name: "Prev Wk",
      "Flu ILI%": flu.lastWeek?.wili ?? null,
      label: flu.lastWeek?.weekLabel,
    },
    {
      name: "This Wk",
      "Flu ILI%": flu.thisWeek?.wili ?? null,
      label: flu.thisWeek?.weekLabel,
    },
  ].filter((d) => d["Flu ILI%"] !== null);

  const wwData = [
    {
      name: "Wk -52 (LY)",
      "Sites Detecting (%)": wastewater.sameWeekLastYear?.detectProp ?? null,
      label: wastewater.sameWeekLastYear?.weekLabel,
    },
    {
      name: "Prev Wk",
      "Sites Detecting (%)": wastewater.lastWeek?.detectProp ?? null,
      label: wastewater.lastWeek?.weekLabel,
    },
    {
      name: "This Wk",
      "Sites Detecting (%)":
        (wastewater.thisWeek ?? wastewater.lastWeek)?.detectProp ?? null,
      label: (wastewater.thisWeek ?? wastewater.lastWeek)?.weekLabel,
    },
  ].filter((d) => d["Sites Detecting (%)"] !== null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Flu trend */}
      <Card>
        <CardHeader>
          <CardTitle>Flu ILI% — 3-Point Comparison</CardTitle>
        </CardHeader>
        {fluData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={fluData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(v: number) => [`${v.toFixed(2)}%`, "ILI%"]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Flu ILI%" fill="#E8001C" opacity={0.8} radius={[3, 3, 0, 0]} />
              <Line
                type="monotone"
                dataKey="Flu ILI%"
                stroke="#B50016"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-40 text-molly-slate text-sm">
            Flu data unavailable
          </div>
        )}
      </Card>

      {/* Wastewater trend */}
      <Card>
        <CardHeader>
          <CardTitle>COVID Wastewater Detection — 3-Point Comparison</CardTitle>
        </CardHeader>
        {wwData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={wwData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(v: number) => [`${v}%`, "Sites detecting"]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="Sites Detecting (%)"
                fill="#F97316"
                opacity={0.8}
                radius={[3, 3, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="Sites Detecting (%)"
                stroke="#C2410C"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-40 text-molly-slate text-sm">
            Wastewater data unavailable
          </div>
        )}
      </Card>
    </div>
  );
}
