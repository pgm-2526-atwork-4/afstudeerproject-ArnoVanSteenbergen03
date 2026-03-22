"use client";

import { OperatingInfo, TimeRange } from "@shared/index";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type DayKey = (typeof DAYS)[number];

const DEFAULT_HOURS: TimeRange = { open: "09:00", close: "17:00" };

interface OpeningHoursFormProps {
  value: OperatingInfo;
  onChange: (hours: OperatingInfo) => void;
}

export default function OpeningHoursForm({
  value,
  onChange,
}: OpeningHoursFormProps) {
  const isDayOpen = (day: DayKey) => value[day] !== null;

  const toggleDay = (day: DayKey) => {
    const newValue = { ...value };
    newValue[day] = newValue[day] ? null : DEFAULT_HOURS;
    onChange(newValue);
  };

  const updateTime = (day: DayKey, field: "open" | "close", time: string) => {
    const newValue = { ...value };
    if (newValue[day]) {
      newValue[day] = { ...(newValue[day] as TimeRange), [field]: time };
    } else {
      newValue[day] = { open: "", close: "" };
      if (field === "open") {
        (newValue[day] as TimeRange).open = time;
      } else {
        (newValue[day] as TimeRange).close = time;
      }
    }
    onChange(newValue);
  };

  const getHours = (day: DayKey): TimeRange | null => {
    return value[day];
  };

  return (
    <div className="space-y-4">
      {DAYS.map((day) => (
        <div key={day} className="border-2 border-slate-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 capitalize">{day}</h3>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`hours-${day}`}
                checked={isDayOpen(day)}
                onCheckedChange={(checked) => {
                  const shouldOpen = checked === true;
                  if (shouldOpen !== isDayOpen(day)) {
                    toggleDay(day);
                  }
                }}
                className="border-slate-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <Label
                htmlFor={`hours-${day}`}
                className={`text-sm font-semibold ${
                  isDayOpen(day) ? "text-green-700" : "text-slate-500"
                }`}
              >
                {isDayOpen(day) ? "Open" : "Closed"}
              </Label>
            </div>
          </div>

          {isDayOpen(day) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Opens
                </Label>
                <Input
                  type="time"
                  value={getHours(day)?.open || ""}
                  onChange={(e) => updateTime(day, "open", e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-semibold text-slate-800 mb-2">
                  Closes
                </Label>
                <Input
                  type="time"
                  value={getHours(day)?.close || ""}
                  onChange={(e) => updateTime(day, "close", e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-800 rounded"
                  required
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
