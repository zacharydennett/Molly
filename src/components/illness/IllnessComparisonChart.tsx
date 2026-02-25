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
  ReferenceArea,
} from "recharts";
import type { IllnessApiResponse } from "@/types/illness";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface Props {
  flu: IllnessApiResponse["flu"];
  wastewater: IllnessApiResponse["wastewater"];
}

// CDC WVAL level bands (Very Low → Very High)
const WVAL_BANDS = [
  { y1: 0,   y2: 2,   fill: "#bbf7d0" }, // Very Low  — green
  { y1: 2,   y2: 3.4, fill: "#d9f99d" }, // Low       — lime
  { y1: 3.4, y2: 5.3, fill: "#fef08a" }, // Moderate  — yellow
  { y1: 5.3, y2: 7.8, fill: "#fed7aa" }, // High      — orange
  { y1: 7.8, y2: 20,  fill: "#fecaca" }, // Very High — red
];

export function IllnessComparisonChart({ flu, wastewater }: Props) {
  const fluData = [
    {
      name: "Wk -52 (LY)",
      "Flu ILI%": flu.sameWeekLastYear?.wili ?? null,
    },
    {
      name: "Prev Wk",
      "Flu ILI%": flu.lastWeek?.wili ?? null,
    },
    {
      name: "This Wk",
      "Flu ILI%": flu.thisWeek?.wili ?? null,
    },
  ].filter((d) => d["Flu ILI%"] !== null);

  const wwData = wastewater.trendSeries.map((pt) => ({
    name: pt.weekLabel,
    National: pt.national,
    "Nat'l LY": pt.nationalLY,
    Midwest: pt.midwest,
    Northeast: pt.northeast,
    South: pt.south,
    West: pt.west,
  }));

  // Dynamic Y max so regional spikes don't clip
  const allWvals = wastewater.trendSeries.flatMap((pt) =>
    [pt.national, pt.midwest, pt.northeast, pt.south, pt.west, pt.nationalLY].filter(
      (v): v is number => v != null
    )
  );
  const yMax = allWvals.length > 0 ? Math.max(Math.ceil(Math.max(...allWvals)) + 0.5, 9) : 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Flu 3-point comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Flu ILI% — 3-Point Comparison</CardTitle>
        </CardHeader>
        {fluData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
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

      {/* COVID WVAL 12-week trend — national + 4 regions + LY */}
      <Card>
        <CardHeader>
          <CardTitle>COVID Wastewater Activity — 12-Week Trend</CardTitle>
        </CardHeader>
        {wwData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={wwData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                {/* WVAL level shading */}
                {WVAL_BANDS.map((band) => (
                  <ReferenceArea
                    key={band.y1}
                    y1={band.y1}
                    y2={Math.min(band.y2, yMax)}
                    fill={band.fill}
                    fillOpacity={0.35}
                    ifOverflow="hidden"
                  />
                ))}
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.7} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} domain={[0, yMax]} width={28} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(v: number, name: string) => [
                    v != null ? v.toFixed(2) : "—",
                    name,
                  ]}
                  labelFormatter={(label) => `Week ending ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />

                {/* Regional lines — thin */}
                <Line type="monotone" dataKey="Midwest"   stroke="#8B5CF6" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="Northeast" stroke="#3B82F6" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="South"     stroke="#22C55E" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="West"      stroke="#EAB308" strokeWidth={1} dot={false} />

                {/* National last year — dashed gray */}
                <Line
                  type="monotone"
                  dataKey="Nat'l LY"
                  stroke="#94A3B8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />

                {/* National this year — bold primary */}
                <Line
                  type="monotone"
                  dataKey="National"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#F97316" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-xs text-molly-slate text-center mt-1">
              WVAL: Wastewater Viral Activity Level (CDC NWSS) ·{" "}
              <span className="text-slate-400">— — same week last year</span>
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
