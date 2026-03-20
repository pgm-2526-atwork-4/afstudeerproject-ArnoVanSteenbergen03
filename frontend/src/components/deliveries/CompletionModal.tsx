"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";

type CompletionOption = "completed" | "incomplete";

interface CompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: CompletionOption, data?: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function CompletionModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: CompletionModalProps) {
  const [selected, setSelected] = useState<CompletionOption | null>(null);
  const [incompleteReason, setIncompleteReason] = useState("");

  const reset = () => {
    setSelected(null);
    setIncompleteReason("");
  };

  const handleClose = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  const handleSubmit = () => {
    if (!selected) return;

    if (selected === "completed") {
      onSubmit("completed");
    } else if (selected === "incomplete") {
      onSubmit("incomplete", { incompleteReason });
    }
  };

  const canSubmit = () => {
    if (!selected) return false;
    if (selected === "incomplete" && !incompleteReason.trim()) return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Order</DialogTitle>
        </DialogHeader>

        {!selected && (
          <div className="space-y-3 mt-2">
            <button
              onClick={() => setSelected("completed")}
              className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-colors text-left"
            >
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Complete</p>
                <p className="text-xs text-slate-500">
                  Delivery was successful
                </p>
              </div>
            </button>

            <button
              onClick={() => setSelected("incomplete")}
              className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 transition-colors text-left"
            >
              <XCircle className="w-6 h-6 text-orange-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Incomplete</p>
                <p className="text-xs text-slate-500">
                  Could not finish the delivery
                </p>
              </div>
            </button>
          </div>
        )}

        {selected === "completed" && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-600">
              Mark this delivery as successfully completed?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelected(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? "Submitting..." : "Confirm Complete"}
              </Button>
            </div>
          </div>
        )}

        {selected === "incomplete" && (
          <div className="space-y-4 mt-2">
            <div>
              <Label className="block text-sm font-medium text-slate-700 mb-1">
                Reason for incomplete delivery
              </Label>
              <Textarea
                value={incompleteReason}
                onChange={(e) => setIncompleteReason(e.target.value)}
                placeholder="Describe why the delivery could not be completed..."
                className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-orange-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelected(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !canSubmit()}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
