"use client";

import { useWeatherData } from "@/hooks/useWeatherData";
import { LoadingCard } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { RegionCard } from "./RegionCard";
import { WeatherComparisonChart } from "./WeatherComparisonChart";
import { CloudSun, Info } from "lucide-react";

export function WeatherDashboard() {
  const { data, error, isLoading, refetch } = useWeatherData();

  if (isLoading) return <LoadingCard message="Fetching weather data for 5 US regions…" />;
  if (error || !data)
    return (
      <ErrorBanner
        message="Could not load weather data from Open-Meteo."
        onRetry={() => refetch()}
      />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-molly-navy flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-molly-amber" />
            National Weather Overview
          </h1>
          <p className="text-sm text-molly-slate mt-1">
            Last week vs. previous week vs. same week last year · 5 US regions
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-molly-slate bg-slate-100 rounded-lg px-3 py-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Open-Meteo · Updated every 6 hrs</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-medium">
        {[
          { color: "bg-molly-navy", label: "Last Week" },
          { color: "bg-blue-300", label: "Previous Week" },
          { color: "bg-slate-400", label: "Same Week Last Year" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-molly-slate">{label}</span>
          </div>
        ))}
      </div>

      {/* Region Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {data.regions.map((region) => (
          <RegionCard key={region.regionId} region={region} />
        ))}
      </div>

      {/* Chart */}
      <WeatherComparisonChart regions={data.regions} />

      <p className="text-xs text-molly-slate text-center">
        Data generated {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
