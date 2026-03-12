"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatMonthYear(year: number, month: number) {
  return new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

interface RecurrenceStepProps {
  onNext: (data: { selectedDates: string[]; recurrenceTime: string }) => void;
  onBack: () => void;
  initialDates?: string[];
  initialTime?: string;
}

export default function RecurrenceStep({
  onNext,
  onBack,
  initialDates = [],
  initialTime = "09:00",
}: RecurrenceStepProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<string[]>(initialDates);
  const [recurrenceTime, setRecurrenceTime] = useState(initialTime);
  const [validationError, setValidationError] = useState<string | null>(null);

  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const toggleDate = (dateKey: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateKey)
        ? prev.filter((d) => d !== dateKey)
        : [...prev, dateKey],
    );
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleNext = () => {
    if (selectedDates.length === 0) {
      setValidationError("Please select at least one date on the calendar.");
      return;
    }
    if (!recurrenceTime) {
      setValidationError("Please select a pickup time.");
      return;
    }
    setValidationError(null);

    onNext({
      selectedDates: [...selectedDates].sort(),
      recurrenceTime,
    });
  };

  // Build calendar grid
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-800 hover:text-slate-600 font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Select pickup dates
        </Label>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className={`p-2 rounded-lg transition-colors ${
              canGoPrev
                ? "hover:bg-slate-100 text-slate-800"
                : "text-slate-300 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-slate-800">
            {formatMonthYear(viewYear, viewMonth)}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-semibold text-slate-500 py-1"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />;
            }

            const dateKey = formatDateKey(viewYear, viewMonth, day);
            const isSelected = selectedDates.includes(dateKey);
            const isPast = dateKey < todayKey;

            return (
              <button
                key={dateKey}
                onClick={() => !isPast && toggleDate(dateKey)}
                disabled={isPast}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isPast
                    ? "text-slate-300 cursor-not-allowed"
                    : isSelected
                      ? "bg-orange-600 text-white"
                      : dateKey === todayKey
                        ? "bg-slate-100 text-slate-800 hover:bg-orange-100 border border-slate-400"
                        : "text-slate-800 hover:bg-orange-100"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {selectedDates.length > 0 && (
          <p className="mt-4 text-sm text-slate-600">
            {selectedDates.length} date{selectedDates.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
        )}
      </div>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Pickup time (for all selected dates)
        </Label>
        <Input
          type="time"
          value={recurrenceTime}
          onChange={(e) => setRecurrenceTime(e.target.value)}
          className="w-full px-3 py-2 border-2 border-slate-800 rounded"
        />
      </div>

      {selectedDates.length > 0 && (
        <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
          <Label className="block text-sm font-semibold text-slate-800 mb-3">
            Selected dates
          </Label>
          <div className="flex flex-wrap gap-2">
            {[...selectedDates].sort().map((date) => (
              <span
                key={date}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-800 text-sm rounded-full"
              >
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                <button
                  onClick={() => toggleDate(date)}
                  className="ml-1 text-orange-500 hover:text-orange-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {validationError && (
        <p className="text-red-600 text-sm text-center">{validationError}</p>
      )}

      <Button
        onClick={handleNext}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg"
      >
        Next: Add Goods
      </Button>
    </div>
  );
}
