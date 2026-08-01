import { cn } from "@/utils/util";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[.07]", className)} />;
}
