"use client";

import { Stethoscope, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useWeek } from "@/contexts/WeekContext";
import { getRecentSaturdays } from "@/lib/utils/dates";

const SATURDAYS = getRecentSaturdays(12);

export function MollyHeader() {
  const { selectedSaturday, setSaturday } = useWeek();
  const weekEnd = format(selectedSaturday, "yyyy-MM-dd");

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

        {/* Week selector — styled as the red pill */}
        <div className="relative flex items-center">
          <div className="bg-molly-red rounded-full flex items-center pr-2">
            <select
              value={weekEnd}
              onChange={(e) => {
                const d = new Date(`${e.target.value}T12:00:00`);
                setSaturday(d);
              }}
              className="bg-transparent text-white text-xs font-mono font-semibold appearance-none cursor-pointer pl-3 pr-1 py-1.5 outline-none"
            >
              {SATURDAYS.map((sat) => {
                const val = format(sat, "yyyy-MM-dd");
                return (
                  <option key={val} value={val} className="bg-molly-navy text-white">
                    Week ending {format(sat, "MMM d, yyyy")}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3 h-3 text-white pointer-events-none shrink-0" />
          </div>
        </div>
      </div>
    </header>
  );
}
