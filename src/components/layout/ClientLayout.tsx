"use client";

import { WeekContextProvider } from "@/contexts/WeekContext";
import { MollyHeader } from "./MollyHeader";
import { TabBar } from "./TabBar";
import { Footer } from "./Footer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <WeekContextProvider>
      <MollyHeader />
      <TabBar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 md:px-6 py-6 tab-content">
        {children}
      </main>
      <Footer />
    </WeekContextProvider>
  );
}
