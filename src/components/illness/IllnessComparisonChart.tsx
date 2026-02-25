"use client";

import {
  ComposedChart,
  AreaChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
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

  // 12-week wastewater trend series (oldest → newest)
  const wwTrendData = wastewater.trendSeries.map((pt) => ({
    name: format(new Date(`${pt.weekEnding}T12:00:00Z`), "MMM d"),
    "Sites Detecting (%)": pt.detectProp,
    percentile: pt.avgPercentile,
    sitesReporting: pt.sitesReporting,
    weekEnding: pt.weekEnding,
  }));

  // Same-week-last-year detect_prop as a reference line
  const lyDetectProp = wastewater.sameWeekLastYear?.detectProp ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Flu 3-point comparison */}
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

      {/* COVID wastewater 12-week trend */}
      <Card>
        <CardHeader>
          <CardTitle>COVID Wastewater — 12-Week Trend</CardTitle>
        </CardHeader>
        {wwTrendData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={wwTrendData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="wwGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  unit="%"
                  domain={[0, 100]}
                  width={36}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(value: number, name: string) => {
                    if (name === "Sites Detecting (%)") return [`${value}%`, "Sites detecting"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Week of ${label}`}
                />
                {lyDetectProp != null && (
                  <ReferenceLine
                    y={lyDetectProp}
                    stroke="#94A3B8"
                    strokeDasharray="4 4"
                    label={{ value: `LY: ${lyDetectProp}%`, position: "insideTopRight", fontSize: 9, fill: "#94A3B8" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="Sites Detecting (%)"
                  stroke="#F97316"
                  strokeWidth={2}
                  fill="url(#wwGradient)"
                  dot={{ r: 3, fill: "#F97316" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-molly-slate text-center mt-1">
              % of NWSS monitoring sites detecting SARS-CoV-2
              {lyDetectProp != null && (
                <span className="ml-2 text-slate-400">— — same week last year ({lyDetectProp}%)</span>
              )}
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center h-40 text-molly-slate text-sm">
            Wastewater data unavailable
          </div>
        )}
      </Card>
    </div>
  );
}
