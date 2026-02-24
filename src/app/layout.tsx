import type { Metadata } from "next";
import "./globals.css";
import { MollyHeader } from "@/components/layout/MollyHeader";
import { TabBar } from "@/components/layout/TabBar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Molly — The Monday Reporter",
  description:
    "Weekly retail health & wellness intelligence: weather, illness trends, competitor promotions, and more.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-molly-slate-light">
        <MollyHeader />
        <TabBar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 md:px-6 py-6 tab-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
