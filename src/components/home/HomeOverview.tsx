"use client";

import Link from "next/link";
import { useWeatherData } from "@/hooks/useWeatherData";
import { useIllnessData } from "@/hooks/useIllnessData";
import { useTetrisScores } from "@/hooks/useTetrisScores";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatDelta } from "@/components/ui/StatDelta";
import { Spinner } from "@/components/ui/Spinner";
import { formatTemp, formatDelta, formatScore } from "@/lib/utils/formatters";
import {
  CloudSun, Activity, ShoppingCart, Gamepad2,
  ArrowRight, Thermometer, Snowflake, TrendingUp, TrendingDown, Minus, Trophy
} from "lucide-react";
import type { IllnessLevel } from "@/types/illness";

const LEVEL_CONFIG: Record<IllnessLevel, { label: string; variant: "green" | "amber" | "orange" | "red" | "slate" }> = {
  minimal: { label: "Minimal", variant: "green" },
  low: { label: "Low", variant: "green" },
  moderate: { label: "Moderate", variant: "amber" },
  high: { label: "High", variant: "orange" },
  very_high: { label: "Very High", variant: "red" },
  unknown: { label: "Unknown", variant: "slate" },
};

export function HomeOverview() {
  const weather = useWeatherData();
  const illness = useIllnessData();
  const { scores } = useTetrisScores();

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-molly-navy to-molly-navy-light rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-black tracking-tight">Good Monday! 👋</h1>
        <p className="text-blue-200 mt-1 text-sm">
          Here&apos;s your weekly retail health &amp; wellness briefing. Select a tab above for full details.
        </p>
      </div>

      {/* Overview grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Weather card */}
        <Link href="/weather" className="group">
          <Card className="h-full hover:shadow-card-hover transition-shadow group-hover:border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 rounded-lg p-1.5">
                  <CloudSun className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-semibold text-sm text-molly-ink">Weather</span>
              </div>
              <ArrowRight className="w-4 h-4 text-molly-slate group-hover:text-molly-navy transition-colors" />
            </div>

            {weather.isLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : weather.data ? (
              <div className="space-y-2">
                {weather.data.regions.slice(0, 3).map((region) => {
                  const lw = region.weeks.lastWeek;
                  const pw = region.weeks.previousWeek;
                  const delta = formatDelta(lw.avgTempF, pw.avgTempF, "°");
                  return (
                    <div key={region.regionId} className="flex items-center justify-between text-xs">
                      <span className="text-molly-slate w-20 shrink-0">{region.regionLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-molly-ink">{formatTemp(lw.avgTempF)}</span>
                        <StatDelta value={delta.value} direction={delta.direction} />
                        {lw.hasSevereStorm && <Badge variant="red">⚡</Badge>}
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-molly-slate mt-1">+2 more regions →</p>
              </div>
            ) : (
              <p className="text-xs text-molly-slate">Weather data unavailable</p>
            )}
          </Card>
        </Link>

        {/* Illness card */}
        <Link href="/illness" className="group">
          <Card className="h-full hover:shadow-card-hover transition-shadow group-hover:border-red-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-red-100 rounded-lg p-1.5">
                  <Activity className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-semibold text-sm text-molly-ink">Illness</span>
              </div>
              <ArrowRight className="w-4 h-4 text-molly-slate group-hover:text-molly-red transition-colors" />
            </div>

            {illness.isLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : illness.data ? (
              <div className="space-y-3">
                {/* Flu */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-molly-slate">Flu (ILI%)</span>
                    <Badge variant={LEVEL_CONFIG[illness.data.flu.nationalLevel].variant}>
                      {LEVEL_CONFIG[illness.data.flu.nationalLevel].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono text-molly-red">
                      {illness.data.flu.lastWeek?.wili?.toFixed(1) ?? "–"}%
                    </span>
                    {illness.data.flu.trend === "rising" && <TrendingUp className="w-4 h-4 text-red-500" />}
                    {illness.data.flu.trend === "falling" && <TrendingDown className="w-4 h-4 text-green-500" />}
                    {illness.data.flu.trend === "stable" && <Minus className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
                {/* COVID Wastewater */}
                <div>
                  <span className="text-xs font-semibold text-molly-slate">COVID Wastewater</span>
                  <div className="text-lg font-bold font-mono text-molly-orange">
                    {illness.data.wastewater.thisWeek?.detectProp != null
                      ? `${illness.data.wastewater.thisWeek.detectProp}% sites`
                      : illness.data.wastewater.lastWeek?.detectProp != null
                      ? `${illness.data.wastewater.lastWeek.detectProp}% sites`
                      : "–"}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-molly-slate">Illness data unavailable</p>
            )}
          </Card>
        </Link>

        {/* Competitor Ads card */}
        <Link href="/competitor-ads" className="group">
          <Card className="h-full hover:shadow-card-hover transition-shadow group-hover:border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 rounded-lg p-1.5">
                  <ShoppingCart className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-semibold text-sm text-molly-ink">Competitor Ads</span>
              </div>
              <ArrowRight className="w-4 h-4 text-molly-slate group-hover:text-green-600 transition-colors" />
            </div>
            <div className="space-y-2">
              {[
                { name: "CVS", color: "#CC0000" },
                { name: "Walmart", color: "#0071CE" },
                { name: "Walgreens", color: "#E31837" },
                { name: "Costco", color: "#005DAA" },
                { name: "Kroger", color: "#005DAA" },
              ].map(({ name, color }) => (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-molly-ink font-medium">{name}</span>
                  <span className="text-molly-slate ml-auto">Weekly Ad</span>
                </div>
              ))}
              <p className="text-xs text-molly-slate mt-1">Via Wayback Machine →</p>
            </div>
          </Card>
        </Link>

        {/* Tetris card */}
        <Link href="/tetris" className="group">
          <Card className="h-full hover:shadow-card-hover transition-shadow group-hover:border-molly-amber">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 rounded-lg p-1.5">
                  <Gamepad2 className="w-4 h-4 text-amber-600" />
                </div>
                <span className="font-semibold text-sm text-molly-ink">POG Process</span>
              </div>
              <ArrowRight className="w-4 h-4 text-molly-slate group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-molly-slate">Health &amp; Wellness Product Game</p>
              {/* Mini leaderboard preview */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-molly-amber font-semibold">
                  <Trophy className="w-3 h-3" />
                  Top Scores
                </div>
                {scores.length === 0 ? (
                  <p className="text-xs text-molly-slate">No scores yet — be first!</p>
                ) : (
                  scores.slice(0, 3).map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span className="text-molly-slate w-4">{i + 1}.</span>
                      <span className="font-mono font-bold text-molly-ink">{s.player_name}</span>
                      <span className="ml-auto font-mono text-molly-slate">{formatScore(s.score)}</span>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-molly-amber font-semibold mt-2">Play now →</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Quick key insights */}
      {!weather.isLoading && weather.data && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4">
          <h2 className="text-sm font-bold text-molly-ink mb-3">
            🗒 This Week&apos;s Snapshot
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {weather.data.regions.map((r) => (
              <div key={r.regionId} className="text-center">
                <div className="flex items-center justify-center gap-1 text-molly-slate text-xs mb-1">
                  <Thermometer className="w-3 h-3" />
                  {r.regionLabel}
                </div>
                <div className="font-black text-molly-navy font-mono">
                  {formatTemp(r.weeks.lastWeek.avgTempF)}
                </div>
                {r.weeks.lastWeek.totalSnowfallInches > 0 && (
                  <div className="flex items-center justify-center gap-1 text-blue-500 text-xs mt-0.5">
                    <Snowflake className="w-3 h-3" />
                    {r.weeks.lastWeek.totalSnowfallInches.toFixed(1)}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
