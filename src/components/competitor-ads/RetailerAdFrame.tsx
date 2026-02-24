"use client";

import { useState, useRef, useEffect } from "react";
import type { RetailerAdData } from "@/types/competitor-ads";
import { ExternalLink, Clock, AlertCircle, Archive } from "lucide-react";

interface Props {
  retailer: RetailerAdData;
}

export function RetailerAdFrame({ retailer }: Props) {
  const [iframeStatus, setIframeStatus] = useState<"loading" | "loaded" | "failed">("loading");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!retailer.archiveUrl) {
      setIframeStatus("failed");
      return;
    }
    setIframeStatus("loading");
    timeoutRef.current = setTimeout(() => {
      setIframeStatus((prev) => (prev === "loading" ? "failed" : prev));
    }, 10000);
    return () => clearTimeout(timeoutRef.current);
  }, [retailer.archiveUrl]);

  const handleLoad = () => {
    clearTimeout(timeoutRef.current);
    setIframeStatus("loaded");
  };

  const handleError = () => {
    clearTimeout(timeoutRef.current);
    setIframeStatus("failed");
  };

  return (
    <div className="space-y-3">
      {/* Metadata bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-molly-slate">
          {retailer.snapshotDate ? (
            <>
              <Archive className="w-3.5 h-3.5" />
              <span>
                Archived snapshot: <span className="font-semibold text-molly-ink">{retailer.snapshotDate}</span>
              </span>
            </>
          ) : (
            <span className="text-amber-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              No recent Wayback Machine snapshot found
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {retailer.archiveUrl && (
            <a
              href={retailer.archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-molly-navy font-medium hover:underline px-2 py-1 bg-blue-50 rounded"
            >
              <Archive className="w-3 h-3" />
              Open Archive
            </a>
          )}
          <a
            href={retailer.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-white font-medium px-3 py-1 rounded"
            style={{ backgroundColor: retailer.color }}
          >
            <ExternalLink className="w-3 h-3" />
            Current Ad
          </a>
        </div>
      </div>

      {/* iframe or fallback */}
      {retailer.archiveUrl && iframeStatus !== "failed" ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          {iframeStatus === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 gap-2">
              <div className="animate-spin rounded-full border-2 border-slate-300 border-t-molly-navy h-8 w-8" />
              <p className="text-sm text-molly-slate">Loading Wayback Machine snapshot…</p>
            </div>
          )}
          <iframe
            src={retailer.archiveUrl}
            className="w-full border-0"
            style={{ height: "600px", minHeight: "400px" }}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
            title={`${retailer.name} Weekly Ad Archive`}
          />
        </div>
      ) : (
        /* Fallback card */
        <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <div
            className="text-4xl font-black text-white px-6 py-3 rounded-xl"
            style={{ backgroundColor: retailer.color }}
          >
            {retailer.shortName}
          </div>
          <div className="text-center">
            <p className="text-molly-slate text-sm">
              {retailer.error
                ? "Archive snapshot could not be loaded."
                : "No recent Wayback Machine snapshot available for this retailer."}
            </p>
            <p className="text-xs text-molly-slate mt-1 opacity-70">
              Visit their current weekly ad directly:
            </p>
          </div>
          <a
            href={retailer.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: retailer.color }}
          >
            <ExternalLink className="w-4 h-4" />
            View {retailer.name} Weekly Ad
          </a>
          {retailer.error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {retailer.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
