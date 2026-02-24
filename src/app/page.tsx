import { HomeOverview } from "@/components/home/HomeOverview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Molly — The Monday Reporter",
  description: "Weekly retail health & wellness intelligence dashboard",
};

export default function HomePage() {
  return <HomeOverview />;
}
