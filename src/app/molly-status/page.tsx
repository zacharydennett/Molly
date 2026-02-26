"use client";

import { useEffect, useState, useCallback } from "react";

type StatusData = Record<string, unknown>;

function Val({ v }: { v: unknown }) {
  if (v === null || v === undefined) return <span className="text-slate-400">null</span>;
  if (typeof v === "boolean") return <span className={v ? "text-green-600" : "text-red-500"}>{String(v)}</span>;
  if (typeof v === "string") {
    const isError = v.toLowerCase().includes("missing") || v.toLowerCase().includes("error");
    const isOk = v.startsWith("ok") || v.startsWith("set");
    return (
      <span className={isError ? "text-red-500 font-semibold" : isOk ? "text-green-600" : "text-slate-700"}>
        {v}
      </span>
    );
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return <span className="text-slate-400">[]</span>;
    return (
      <ul className="ml-4 space-y-1 list-disc">
        {v.map((item, i) => (
          <li key={i}>{typeof item === "object" ? <NestedObj obj={item as Record<string, unknown>} /> : <Val v={item} />}</li>
        ))}
      </ul>
    );
  }
  if (typeof v === "object") return <NestedObj obj={v as Record<string, unknown>} />;
  return <span className="text-slate-700">{String(v)}</span>;
}

function NestedObj({ obj }: { obj: Record<string, unknown> }) {
  return (
    <table className="text-xs border-collapse ml-2">
      <tbody>
        {Object.entries(obj).map(([k, v]) => (
          <tr key={k} className="align-top">
            <td className="pr-3 py-0.5 text-slate-500 font-mono whitespace-nowrap">{k}</td>
            <td className="py-0.5"><Val v={v} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function MollyStatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/molly-status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLastFetched(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const sections: { key: string; label: string }[] = [
    { key: "env", label: "Environment Variables" },
    { key: "updatePolicyCheck", label: "Supabase UPDATE Policy" },
    { key: "storageBuckets", label: "Storage Buckets" },
    { key: "bucketFiles", label: "Files in competitor-ads-screenshots" },
    { key: "cacheRows", label: "competitor_ads_cache (latest 10 weeks)" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-mono text-sm">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Molly Status</h1>
          <div className="flex items-center gap-3">
            {lastFetched && <span className="text-xs text-slate-400">fetched {lastFetched}</span>}
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-600 text-xs">{error}</div>
        )}

        {data &&
          sections.map(({ key, label }) => (
            <div key={key} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {label}
              </div>
              <div className="p-4 text-xs overflow-x-auto">
                {key in data ? <Val v={data[key]} /> : <span className="text-slate-400">no data</span>}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
