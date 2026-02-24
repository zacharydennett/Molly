import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatDelta } from "@/components/ui/StatDelta";
import { formatTemp, formatSnow, formatDelta } from "@/lib/utils/formatters";
import type { RegionWeekData } from "@/types/weather";
import { Thermometer, Snowflake, Zap, MapPin } from "lucide-react";

interface Props {
  region: RegionWeekData;
}

export function RegionCard({ region }: Props) {
  const { lastWeek: lw, previousWeek: pw, sameWeekLastYear: swly } = region.weeks;

  const tempDeltaWoW = formatDelta(lw.avgTempF, pw.avgTempF, "°");
  const tempDeltaYoY = formatDelta(lw.avgTempF, swly.avgTempF, "°");
  const snowDeltaWoW = formatDelta(lw.totalSnowfallInches, pw.totalSnowfallInches, '"');

  return (
    <Card className="flex flex-col gap-3">
      {/* Region name */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-molly-navy text-sm">{region.regionLabel}</h3>
          {lw.hasSevereStorm && (
            <Badge variant="red">
              <Zap className="w-3 h-3 mr-1" />
              Storm
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-molly-slate mt-0.5">
          <MapPin className="w-3 h-3" />
          {region.city}
        </div>
      </div>

      {/* Temperature */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-molly-slate uppercase tracking-wide mb-1">
          <Thermometer className="w-3.5 h-3.5" />
          Temperature
        </div>
        <div className="text-2xl font-bold text-molly-ink font-mono">
          {formatTemp(lw.avgTempF)}
        </div>
        <div className="text-xs text-molly-slate mt-0.5">
          {formatTemp(lw.minTempF)} – {formatTemp(lw.maxTempF)} range
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          <StatDelta
            value={tempDeltaWoW.value}
            direction={tempDeltaWoW.direction}
            label="vs last wk"
          />
          <StatDelta
            value={tempDeltaYoY.value}
            direction={tempDeltaYoY.direction}
            label="vs last yr"
          />
        </div>
      </div>

      {/* Snowfall */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-molly-slate uppercase tracking-wide mb-1">
          <Snowflake className="w-3.5 h-3.5" />
          Snowfall
        </div>
        <div className="text-xl font-bold text-molly-ink font-mono">
          {formatSnow(lw.totalSnowfallInches)}
        </div>
        <StatDelta
          value={snowDeltaWoW.value}
          direction={snowDeltaWoW.direction}
          label="vs prev wk"
          className="mt-1"
        />
      </div>

      {/* Storm label */}
      {lw.stormLabel && (
        <div className="text-xs text-molly-slate border-t border-slate-100 pt-2">
          Notable: <span className="font-semibold text-molly-ink">{lw.stormLabel}</span>
        </div>
      )}

      {/* Mini comparison bars */}
      <div className="border-t border-slate-100 pt-2 space-y-1.5">
        {[
          { label: "Last Wk", temp: lw.avgTempF, color: "bg-molly-navy" },
          { label: "Prev Wk", temp: pw.avgTempF, color: "bg-blue-300" },
          { label: "Last Yr", temp: swly.avgTempF, color: "bg-slate-400" },
        ].map(({ label, temp, color }) => {
          const allTemps = [lw.avgTempF, pw.avgTempF, swly.avgTempF];
          const maxT = Math.max(...allTemps, 1);
          const minT = Math.min(...allTemps);
          const pct = maxT === minT ? 50 : ((temp - minT) / (maxT - minT)) * 70 + 15;
          return (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="w-12 text-molly-slate shrink-0">{label}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-molly-ink">{formatTemp(temp)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
