"use client";

import { Stethoscope } from "lucide-react";
import { getThisMondayLabel } from "@/lib/utils/dates";

export function MollyHeader() {
  const dateLabel = getThisMondayLabel();

  return (
    <header className="bg-molly-navy text-white px-4 py-3 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-molly-red rounded-lg p-1.5">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">MOLLY</span>
              <span className="text-molly-red text-xs font-semibold tracking-widest uppercase hidden sm:inline">
                The Monday Reporter
              </span>
            </div>
            <p className="text-blue-200 text-xs hidden md:block">
              Retail Health &amp; Wellness Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-molly-red text-white text-xs font-mono font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
            {dateLabel}
          </div>
        </div>
      </div>
    </header>
  );
}
