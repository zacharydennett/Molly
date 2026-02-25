import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
