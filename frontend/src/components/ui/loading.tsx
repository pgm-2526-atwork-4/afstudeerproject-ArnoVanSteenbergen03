import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border-2 border-slate-200 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded w-36" />
            <div className="h-5 bg-slate-200 rounded-full w-20" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-3 bg-slate-200 rounded w-28" />
            <div className="h-3 bg-slate-200 rounded w-32" />
            <div className="h-3 bg-slate-200 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
