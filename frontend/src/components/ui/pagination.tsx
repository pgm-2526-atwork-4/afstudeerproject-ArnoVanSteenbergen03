import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  label = "items",
}: PaginationProps) {
  if (total === 0) return null;

  return (
    <div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-600"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-slate-600 px-3">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-600"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      <p className="text-center text-xs text-slate-400 py-4">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} {label}
      </p>
    </div>
  );
}
