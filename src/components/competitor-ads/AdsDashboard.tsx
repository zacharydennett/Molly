"use client";

import { useCompetitorAds } from "@/hooks/useCompetitorAds";
import { LoadingCard } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { RetailerAdFrame } from "./RetailerAdFrame";
import { ShoppingCart, Info } from "lucide-react";

export function AdsDashboard() {
  const { data, error, isLoading, refetch } = useCompetitorAds();

  if (isLoading) return <LoadingCard message="Looking up Wayback Machine archives…" />;
  if (error || !data)
    return <ErrorBanner message="Could not load competitor data." onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-molly-navy flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-molly-green" />
            Competitor Homepages
          </h1>
          <p className="text-sm text-molly-slate mt-1">
            Wayback Machine snapshots · Wednesday of previous week vs. same week last year
          </p>
          <p className="text-xs text-molly-slate mt-0.5">
            Comparing <span className="font-semibold text-molly-ink">{data.prevWeekLabel}</span>
            {" "}vs.{" "}
            <span className="font-semibold text-molly-ink">{data.lastYearLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-molly-slate bg-slate-100 rounded-lg px-3 py-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Wayback Machine</span>
        </div>
      </div>

      {/* All retailers — load all iframes simultaneously */}
      <div className="space-y-6">
        {data.retailers.map((retailer) => (
          <RetailerAdFrame key={retailer.id} retailer={retailer} />
        ))}
      </div>

      {/* Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        <strong>About these snapshots:</strong> Archived via the Internet Archive Wayback Machine.
        Snapshots are the nearest capture to Wednesday noon for each week.
        JavaScript-heavy pages may not render fully inside the embedded viewer — use &quot;Open in new tab&quot; to view the full archive.
      </div>

      <p className="text-xs text-molly-slate text-center">
        Data generated {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
