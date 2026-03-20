"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 hover:bg-red-50 transition-colors">
            <Checkbox
              id="problem-order-too-large"
              checked={orderTooLarge}
              onCheckedChange={(checked) => setOrderTooLarge(checked === true)}
              className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
            />
            <Label
              htmlFor="problem-order-too-large"
              className="text-sm text-slate-800 cursor-pointer"
            >
              Order too large
            </Label>
          </div>

          {orderTooLarge && (
            <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors ml-4">
              <Checkbox
                id="problem-additional-driver"
                checked={needAdditionalDriver}
                onCheckedChange={(checked) =>
                  setNeedAdditionalDriver(checked === true)
                }
                className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
              />
              <Label
                htmlFor="problem-additional-driver"
                className="text-sm text-orange-800 cursor-pointer"
              >
                Request additional driver
              </Label>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 hover:bg-red-50 transition-colors">
            <Checkbox
              id="problem-vehicle-issue"
              checked={vehicleIssue}
              onCheckedChange={(checked) => setVehicleIssue(checked === true)}
              className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
            />
            <Label
              htmlFor="problem-vehicle-issue"
              className="text-sm text-slate-800 cursor-pointer"
            >
              Vehicle issue
            </Label>
          </div>

          <div>
            <Label className="block text-sm font-medium text-slate-700 mb-1">
              Additional notes (optional)
            </Label>
            <Textarea
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
