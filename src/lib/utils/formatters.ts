import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTemp(f: number): string {
  return `${Math.round(f)}°F`;
}

export function formatSnow(inches: number): string {
  if (inches < 0.1) return "Trace";
  return `${inches.toFixed(1)}"`;
}

export function formatDelta(
  current: number,
  previous: number,
  unit = ""
): { value: string; direction: "up" | "down" | "flat"; isPositive: boolean } {
  const diff = current - previous;
  const abs = Math.abs(diff);
  if (abs < 0.05) return { value: "No change", direction: "flat", isPositive: true };
  return {
    value: `${diff > 0 ? "+" : ""}${abs < 1 ? abs.toFixed(1) : Math.round(abs)}${unit}`,
    direction: diff > 0 ? "up" : "down",
    isPositive: diff > 0,
  };
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatScore(n: number): string {
  return n.toLocaleString("en-US");
}
