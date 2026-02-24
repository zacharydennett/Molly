import { cn } from "@/lib/utils/formatters";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-200 border-t-molly-navy",
        "h-6 w-6",
        className
      )}
    />
  );
}

export function LoadingCard({ message = "Loading data…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-molly-slate">
      <Spinner className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
