"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type CompletionOption = "completed" | "incomplete" | "need_assistance";

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
  const [assistanceOrderTooLarge, setAssistanceOrderTooLarge] = useState(false);
  const [assistanceVehicleIssue, setAssistanceVehicleIssue] = useState(false);
  const [assistanceNotes, setAssistanceNotes] = useState("");

  const reset = () => {
    setSelected(null);
    setIncompleteReason("");
    setAssistanceOrderTooLarge(false);
    setAssistanceVehicleIssue(false);
    setAssistanceNotes("");
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
    } else {
      onSubmit("need_assistance", {
        assistanceOptions: {
          orderTooLarge: assistanceOrderTooLarge,
          vehicleIssue: assistanceVehicleIssue,
        },
        assistanceNotes,
      });
    }
  };

  const canSubmit = () => {
    if (!selected) return false;
    if (selected === "incomplete" && !incompleteReason.trim()) return false;
    if (
      selected === "need_assistance" &&
      !assistanceOrderTooLarge &&
      !assistanceVehicleIssue
    )
      return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Delivery</DialogTitle>
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

            <button
              onClick={() => setSelected("need_assistance")}
              className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-slate-200 hover:border-red-500 hover:bg-red-50 transition-colors text-left"
            >
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Need Assistance</p>
                <p className="text-xs text-slate-500">
                  I need help with this delivery
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason for incomplete delivery
              </label>
              <textarea
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

        {selected === "need_assistance" && (
          <div className="space-y-4 mt-2">
            <p className="text-sm font-medium text-slate-700">
              What do you need help with?
            </p>

            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={assistanceOrderTooLarge}
                onChange={(e) => setAssistanceOrderTooLarge(e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm text-slate-800">Order too large</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={assistanceVehicleIssue}
                onChange={(e) => setAssistanceVehicleIssue(e.target.checked)}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm text-slate-800">Vehicle issue</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional notes (optional)
              </label>
              <textarea
                value={assistanceNotes}
                onChange={(e) => setAssistanceNotes(e.target.value)}
                placeholder="Any extra details..."
                className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-red-500"
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
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? "Submitting..." : "Request Assistance"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
