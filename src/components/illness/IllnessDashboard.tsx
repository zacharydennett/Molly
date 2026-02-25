"use client";

import { useIllnessData } from "@/hooks/useIllnessData";
import { LoadingCard } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { WastewaterTrendChart } from "./CovidTrendChart";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Activity, TrendingUp, TrendingDown, Minus, Info, Droplets } from "lucide-react";
import type { IllnessLevel, Trend } from "@/types/illness";

const WW_LEVEL_BADGE: Record<
  IllnessLevel,
  { label: string; variant: "green" | "amber" | "orange" | "red" | "slate" }
> = {
  minimal:  { label: "Very Low",  variant: "green"  },
  low:      { label: "Low",       variant: "green"  },
  moderate: { label: "Moderate",  variant: "amber"  },
  high:     { label: "High",      variant: "orange" },
  very_high:{ label: "Very High", variant: "red"    },
  unknown:  { label: "Unknown",   variant: "slate"  },
};

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "rising")  return <TrendingUp  className="w-4 h-4 text-red-500"   />;
  if (trend === "falling") return <TrendingDown className="w-4 h-4 text-green-500" />;
  return <Minus className="w-4 h-4 text-slate-400" />;
}

export function IllnessDashboard() {
  const { data, error, isLoading, refetch } = useIllnessData();

  if (isLoading) return <LoadingCard message="Fetching illness data from CDC…" />;
  if (error || !data)
    return <ErrorBanner message="Could not load illness data." onRetry={() => refetch()} />;

  const { wastewater } = data;
  const wwLevelInfo  = WW_LEVEL_BADGE[wastewater.level];

  // Previous week WVAL from trend series (second-to-last point)
  const wwPrevWeek =
    wastewater.trendSeries.length >= 2
      ? wastewater.trendSeries[wastewater.trendSeries.length - 2]
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-molly-navy flex items-center gap-2">
            <Activity className="w-6 h-6 text-molly-red" />
            COVID Levels
          </h1>
          <p className="text-sm text-molly-slate mt-1">
            COVID wastewater activity (CDC NWSS)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-molly-slate bg-slate-100 rounded-lg px-3 py-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>CDC data</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wastewater summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-500" />
              COVID Wastewater Activity
            </CardTitle>
            <div className="flex items-center gap-2">
              <TrendIcon trend={wastewater.trend} />
              <Badge variant={wwLevelInfo.variant}>{wwLevelInfo.label}</Badge>
            </div>
          </CardHeader>
          {wastewater.error && (
            <p className="text-xs text-red-500 mb-2">⚠ Partial data: {wastewater.error}</p>
          )}
          <WastewaterTrendChart wastewater={wastewater} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 pt-3">
            {[
              { label: "Current WVAL", value: wastewater.current?.national },
              { label: "Prev Week",    value: wwPrevWeek?.national },
              { label: "Last Year",    value: wastewater.current?.nationalLY },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="font-bold text-molly-ink text-sm font-mono">
                  {value != null ? value.toFixed(1) : "—"}
                </div>
                <div className="text-molly-slate">{label}</div>
              </div>
            ))}
          </div>
          {wastewater.current && (
            <p className="text-xs text-molly-slate text-center mt-2">
              Week ending {wastewater.current.weekLabel} · CDC NWSS
            </p>
          )}
        </Card>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-3">
          <p className="text-xs font-semibold text-molly-slate mb-2 uppercase tracking-wide">
            WVAL Scale (CDC NWSS)
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Very Low",  range: "≤ 2.0",    color: "bg-green-100 text-green-700"  },
              { label: "Low",       range: "2.0–3.4",  color: "bg-lime-100 text-lime-700"    },
              { label: "Moderate",  range: "3.4–5.3",  color: "bg-amber-100 text-amber-700"  },
              { label: "High",      range: "5.3–7.8",  color: "bg-orange-100 text-orange-700"},
              { label: "Very High", range: "> 7.8",    color: "bg-red-100 text-red-700"      },
            ].map(({ label, range, color }) => (
              <div key={label} className={`${color} px-2 py-1 rounded text-xs font-medium`}>
                {label} <span className="opacity-70">({range})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <p className="text-xs text-molly-slate text-center">
        Data generated {new Date(data.generatedAt).toLocaleString()} · CDC data may lag 1–2 weeks
      </p>
    </div>
  );
}
