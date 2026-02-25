"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { getMostRecentSaturday } from "@/lib/utils/dates";

interface WeekContextValue {
  selectedSaturday: Date;
  weekEnd: string; // YYYY-MM-DD
  setSaturday: (d: Date) => void;
}

const WeekContext = createContext<WeekContextValue | null>(null);

export function WeekContextProvider({ children }: { children: ReactNode }) {
  const [selectedSaturday, setSaturday] = useState<Date>(getMostRecentSaturday);
  const weekEnd = format(selectedSaturday, "yyyy-MM-dd");

  return (
    <WeekContext.Provider value={{ selectedSaturday, weekEnd, setSaturday }}>
      {children}
    </WeekContext.Provider>
  );
}

export function useWeek() {
  const ctx = useContext(WeekContext);
  if (!ctx) throw new Error("useWeek must be used within WeekContextProvider");
  return ctx;
}
