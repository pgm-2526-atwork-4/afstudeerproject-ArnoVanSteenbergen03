import { useMemo, useState } from "react";
import type { RecurrenceSlot } from "@/types";

const DEFAULT_TIME_SLOT = "09:00";

export function useRecurrenceSlots(initialSlots: RecurrenceSlot[] = []) {
  const [selectedDates, setSelectedDates] = useState<string[]>(
    [...new Set(initialSlots.map((slot) => slot.date))].sort(),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialSlots[0]?.date ?? null,
  );
  const [slotByDate, setSlotByDate] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const slot of initialSlots) {
      map[slot.date] = slot.time;
    }
    return map;
  });

  const recurrenceSlots = useMemo(
    () =>
      [...selectedDates]
        .sort()
        .map((date) => ({ date, time: slotByDate[date] ?? DEFAULT_TIME_SLOT })),
    [selectedDates, slotByDate],
  );

  const toggleDate = (dateKey: string) => {
    setSelectedDates((prev) => {
      if (prev.includes(dateKey)) {
        const next = prev.filter((d) => d !== dateKey);
        setSlotByDate((slotMap) => {
          const updated = { ...slotMap };
          delete updated[dateKey];
          return updated;
        });
        if (selectedDate === dateKey) {
          setSelectedDate(next[0] ?? null);
        }
        return next;
      }

      const next = [...prev, dateKey].sort();
      setSlotByDate((slotMap) => ({
        ...slotMap,
        [dateKey]: slotMap[dateKey] || DEFAULT_TIME_SLOT,
      }));
      setSelectedDate(dateKey);
      return next;
    });
  };

  const selectTimeSlot = (time: string) => {
    if (!selectedDate) return;
    setSlotByDate((prev) => ({ ...prev, [selectedDate]: time }));
  };

  const missingTimeDates = useMemo(
    () => selectedDates.filter((date) => !slotByDate[date]),
    [selectedDates, slotByDate],
  );

  return {
    selectedDates,
    selectedDate,
    slotByDate,
    recurrenceSlots,
    missingTimeDates,
    toggleDate,
    selectTimeSlot,
    setSelectedDate,
  };
}
