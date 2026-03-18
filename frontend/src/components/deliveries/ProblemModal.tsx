"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ProblemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Record<string, unknown>) => void;
  submitting: boolean;
}

export default function ProblemModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
}: ProblemModalProps) {
  const [orderTooLarge, setOrderTooLarge] = useState(false);
  const [vehicleIssue, setVehicleIssue] = useState(false);
  const [needAdditionalDriver, setNeedAdditionalDriver] = useState(false);
  const [notes, setNotes] = useState("");

  const reset = () => {
    setOrderTooLarge(false);
    setVehicleIssue(false);
    setNeedAdditionalDriver(false);
    setNotes("");
  };

  const handleClose = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  const handleSubmit = () => {
    if (!orderTooLarge && !vehicleIssue) return;

    onSubmit({
      assistanceOptions: {
        orderTooLarge,
        vehicleIssue,
        needAdditionalDriver: orderTooLarge && needAdditionalDriver,
      },
      assistanceNotes: notes,
    });
  };

  const canSubmit = () => {
    return orderTooLarge || vehicleIssue;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Report Problem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm font-medium text-slate-700">
            What&apos;s the problem?
          </p>

          <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-red-50 transition-colors">
            <input
              type="checkbox"
              checked={orderTooLarge}
              onChange={(e) => setOrderTooLarge(e.target.checked)}
              className="w-4 h-4 accent-red-600"
            />
            <span className="text-sm text-slate-800">Order too large</span>
          </label>

          {orderTooLarge && (
            <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-orange-200 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors ml-4">
              <input
                type="checkbox"
                checked={needAdditionalDriver}
                onChange={(e) => setNeedAdditionalDriver(e.target.checked)}
                className="w-4 h-4 accent-orange-600"
              />
              <span className="text-sm text-orange-800">
                Request additional driver
              </span>
            </label>
          )}

          <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-red-50 transition-colors">
            <input
              type="checkbox"
              checked={vehicleIssue}
              onChange={(e) => setVehicleIssue(e.target.checked)}
              className="w-4 h-4 accent-red-600"
            />
            <span className="text-sm text-slate-800">Vehicle issue</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Additional notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the problem..."
              className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-red-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? "Submitting..." : "Report Problem"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
