"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RegionWeekData } from "@/types/weather";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface Props {
  regions: RegionWeekData[];
}

export function WeatherComparisonChart({ regions }: Props) {
  const tempData = regions.map((r) => ({
    name: r.regionLabel,
    "Last Week": Math.round(r.weeks.lastWeek.avgTempF),
    "Prev Week": Math.round(r.weeks.previousWeek.avgTempF),
    "Last Year": Math.round(r.weeks.sameWeekLastYear.avgTempF),
  }));

  const snowData = regions.map((r) => ({
    name: r.regionLabel,
    "Last Week": r.weeks.lastWeek.totalSnowfallInches,
    "Prev Week": r.weeks.previousWeek.totalSnowfallInches,
    "Last Year": r.weeks.sameWeekLastYear.totalSnowfallInches,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Temperature chart */}
      <Card>
        <CardHeader>
          <CardTitle>Average Temperature by Region (°F)</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={tempData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="°" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(v: number) => [`${v}°F`]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Last Week" fill="#0033A0" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Prev Week" fill="#93C5FD" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Last Year" fill="#94A3B8" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Snowfall chart */}
      <Card>
        <CardHeader>
          <CardTitle>Total Snowfall by Region (inches)</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={snowData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit='"' />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(v: number) => [`${v}"`]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Last Week" fill="#0033A0" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Prev Week" fill="#93C5FD" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Last Year" fill="#94A3B8" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
