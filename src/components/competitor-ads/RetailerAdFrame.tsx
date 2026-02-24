"use client";

import { useState, useEffect } from "react";
import type { RetailerAdData, RetailerSnapshot } from "@/types/competitor-ads";
import { ExternalLink, Archive, AlertCircle, Clock } from "lucide-react";

interface SnapshotPaneProps {
  snapshot: RetailerSnapshot;
  retailerName: string;
  retailerColor: string;
}

function SnapshotPane({ snapshot, retailerName, retailerColor }: SnapshotPaneProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
    snapshot.archiveUrl ? "loading" : "failed"
  );

  useEffect(() => {
    setStatus(snapshot.archiveUrl ? "loading" : "failed");
  }, [snapshot.archiveUrl]);

  return (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Snapshot label + date */}
      <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
        <span className="font-semibold text-molly-ink">{snapshot.label}</span>
        {snapshot.date ? (
          <span className="flex items-center gap-1 text-molly-slate">
            <Archive className="w-3 h-3" />
            {snapshot.date}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-600">
            <Clock className="w-3 h-3" />
            No snapshot found
          </span>
        )}
      </div>

      {/* iframe or fallback */}
      {snapshot.archiveUrl && status !== "failed" ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200">
          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 gap-2">
              <div className="animate-spin rounded-full border-2 border-slate-300 border-t-molly-navy h-6 w-6" />
              <p className="text-xs text-molly-slate">Loading Wayback Machine archive…</p>
              <p className="text-xs text-molly-slate opacity-60">This can take 1–2 minutes</p>
            </div>
          )}
          <iframe
            src={snapshot.archiveUrl}
            className="w-full border-0"
            style={{ height: "560px" }}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("failed")}
            title={`${retailerName} — ${snapshot.label}`}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 h-48">
          <span className="text-xs text-molly-slate text-center">
            {snapshot.error
              ? "Archive could not be loaded."
              : "No Wayback Machine snapshot available."}
          </span>
          {snapshot.archiveUrl && (
            <a
              href={snapshot.archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-white px-3 py-1.5 rounded"
              style={{ backgroundColor: retailerColor }}
            >
              <Archive className="w-3 h-3" />
              Open Archive
            </a>
          )}
          {snapshot.error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {snapshot.error}
            </p>
          )}
        </div>
      )}

      {/* Open in new tab — always visible so users don't have to wait for the slow iframe */}
      {snapshot.archiveUrl && (
        <a
          href={snapshot.archiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start inline-flex items-center gap-1 text-xs text-molly-navy font-medium hover:underline"
        >
          <Archive className="w-3 h-3" />
          {status === "loading" ? "Open in new tab while loading…" : "Open in new tab"}
        </a>
      )}
    </div>
  );
}

interface Props {
  retailer: RetailerAdData;
}

export function RetailerAdFrame({ retailer }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-card p-4 space-y-3">
      {/* Retailer header */}
      <div className="flex items-center justify-between gap-3">
        <h2
          className="text-base font-bold px-3 py-1 rounded-lg text-white"
          style={{ backgroundColor: retailer.color }}
        >
          {retailer.name}
        </h2>
        <a
          href={retailer.directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-molly-slate hover:text-molly-navy"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Live site
        </a>
      </div>

      {/* Two snapshots side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SnapshotPane
          snapshot={retailer.prevWeek}
          retailerName={retailer.name}
          retailerColor={retailer.color}
        />
        <SnapshotPane
          snapshot={retailer.lastYear}
          retailerName={retailer.name}
          retailerColor={retailer.color}
        />
      </div>
    </div>
  );
}
