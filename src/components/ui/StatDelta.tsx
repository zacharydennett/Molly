import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils/formatters";

interface StatDeltaProps {
  value: string;
  direction: "up" | "down" | "flat";
  /** When direction=up means good (e.g. temp rising in winter = warmer = neutral) */
  positiveIsGood?: boolean;
  label?: string;
  className?: string;
}

export function StatDelta({
  value,
  direction,
  positiveIsGood = true,
  label,
  className,
}: StatDeltaProps) {
  const isNeutral = direction === "flat";
  const isGood = direction === "up" ? positiveIsGood : !positiveIsGood;

  const color = isNeutral
    ? "text-molly-slate"
    : isGood
    ? "text-green-600"
    : "text-red-600";

  const Icon =
    direction === "up"
      ? TrendingUp
      : direction === "down"
      ? TrendingDown
      : Minus;

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", color, className)}>
      <Icon className="w-3 h-3" />
      {value}
      {label && <span className="text-molly-slate font-normal ml-1">{label}</span>}
    </span>
  );
}
