"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRecurrenceSlots } from "@/hooks/useRecurrenceSlots";
import type { RecurrenceSlot } from "@/types";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

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

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function buildQuarterHourSlots() {
  const slots: string[] = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

interface RecurrenceStepProps {
  onNext: (data: { recurrenceSlots: RecurrenceSlot[] }) => void;
  onBack: () => void;
  initialSlots?: RecurrenceSlot[];
}

export default function RecurrenceStep({
  onNext,
  onBack,
  initialSlots = [],
}: RecurrenceStepProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const {
    selectedDates,
    selectedDate,
    slotByDate,
    recurrenceSlots,
    missingTimeDates,
    toggleDate,
    selectTimeSlot,
    setSelectedDate,
  } = useRecurrenceSlots(initialSlots);
  const [validationError, setValidationError] = useState<string | null>(null);

  const timeSlots = useMemo(() => buildQuarterHourSlots(), []);

  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

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

    if (missingTimeDates.length > 0) {
      setValidationError("Please choose a time slot for each selected day.");
      return;
    }

    setValidationError(null);

    onNext({
      recurrenceSlots,
    });
  };

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <div className="space-y-6">
      <Button
        type="button"
        onClick={onBack}
        variant="ghost"
        className="flex items-center gap-2 text-slate-800 hover:text-slate-600 font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </Button>

      <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
        <Label className="block text-sm font-semibold text-slate-800 mb-4">
          Select pickup days
        </Label>

        <div className="flex items-center justify-between mb-4">
          <Button
            type="button"
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            variant="ghost"
            size="icon-sm"
            className={`p-2 rounded-lg transition-colors ${
              canGoPrev
                ? "hover:bg-slate-100 text-slate-800"
                : "text-slate-300 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-lg font-bold text-slate-800">
            {formatMonthYear(viewYear, viewMonth)}
          </h3>
          <Button
            type="button"
            onClick={goToNextMonth}
            variant="ghost"
            size="icon-sm"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
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
              <Button
                type="button"
                key={dateKey}
                onClick={() => !isPast && toggleDate(dateKey)}
                disabled={isPast}
                variant="ghost"
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
              </Button>
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

      {selectedDates.length > 0 && (
        <div className="bg-white border-2 border-slate-800 rounded-lg p-6 space-y-4">
          <Label className="block text-sm font-semibold text-slate-800">
            Pick a day, then choose a 15-minute time slot
          </Label>

          <div className="flex flex-wrap gap-2">
            {[...selectedDates].sort().map((date) => {
              const active = selectedDate === date;
              return (
                <Button
                  type="button"
                  key={date}
                  variant="outline"
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    active
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {formatDateLabel(date)}
                </Button>
              );
            })}
          </div>

          {selectedDate && (
            <>
              <p className="text-sm font-medium text-slate-700">
                Time slots for {formatDateLabel(selectedDate)}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
                {timeSlots.map((time) => {
                  const isSelected = slotByDate[selectedDate] === time;
                  return (
                    <Button
                      type="button"
                      key={`${selectedDate}-${time}`}
                      variant="outline"
                      onClick={() => selectTimeSlot(time)}
                      className={`py-2 px-2 rounded border text-xs font-semibold transition-colors ${
                        isSelected
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white text-slate-700 border-slate-300 hover:border-orange-400 hover:bg-orange-50"
                      }`}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {selectedDates.length > 0 && (
        <div className="bg-white border-2 border-slate-800 rounded-lg p-6">
          <Label className="block text-sm font-semibold text-slate-800 mb-3">
            Selected schedule
          </Label>
          <div className="flex flex-wrap gap-2">
            {[...selectedDates].sort().map((date) => (
              <span
                key={date}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-800 text-sm rounded-full"
              >
                {formatDateLabel(date)} at {slotByDate[date] || "--:--"}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => toggleDate(date)}
                  className="ml-1 h-6 px-1 text-orange-500 hover:text-orange-700"
                >
                  x
                </Button>
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
