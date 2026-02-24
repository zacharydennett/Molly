"use client";

import { useState } from "react";
import { useCompetitorAds } from "@/hooks/useCompetitorAds";
import { LoadingCard } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { RetailerAdFrame } from "./RetailerAdFrame";
import { ShoppingCart, Info } from "lucide-react";
import { cn } from "@/lib/utils/formatters";

export function AdsDashboard() {
  const { data, error, isLoading, refetch } = useCompetitorAds();
  const [activeRetailerId, setActiveRetailerId] = useState<string>("cvs");

  if (isLoading) return <LoadingCard message="Looking up Wayback Machine archives…" />;
  if (error || !data)
    return <ErrorBanner message="Could not load competitor ad data." onRetry={() => refetch()} />;

  const activeRetailer = data.retailers.find((r) => r.id === activeRetailerId) ?? data.retailers[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-molly-navy flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-molly-green" />
            Competitor Weekly Ads
          </h1>
          <p className="text-sm text-molly-slate mt-1">
            Recent archived snapshots via the Wayback Machine · Ads update weekly
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-molly-slate bg-slate-100 rounded-lg px-3 py-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Wayback Machine</span>
        </div>
      </div>

      {/* Retailer selector */}
      <div className="flex flex-wrap gap-2">
        {data.retailers.map((retailer) => {
          const isActive = retailer.id === activeRetailerId;
          return (
            <button
              key={retailer.id}
              onClick={() => setActiveRetailerId(retailer.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all border-2",
                isActive
                  ? "text-white border-transparent shadow-md scale-105"
                  : "bg-white text-molly-slate border-slate-200 hover:border-slate-300"
              )}
              style={isActive ? { backgroundColor: retailer.color, borderColor: retailer.color } : {}}
            >
              <span>{retailer.shortName}</span>
              {retailer.snapshotDate && (
                <span className={cn("text-xs", isActive ? "opacity-75" : "text-green-500")}>
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ad frame */}
      {activeRetailer && (
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-4">
          <RetailerAdFrame retailer={activeRetailer} />
        </div>
      )}

      {/* Archive note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        <strong>About Wayback Machine archives:</strong> These are snapshots of retailer websites captured by
        the Internet Archive. They may be 1–7 days behind the current live ad. For the most current
        promotions, use the &quot;Current Ad&quot; button to visit the retailer directly. Some JavaScript-heavy
        pages may not render fully inside the embedded viewer.
      </div>

      <p className="text-xs text-molly-slate text-center">
        Data generated {new Date(data.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
