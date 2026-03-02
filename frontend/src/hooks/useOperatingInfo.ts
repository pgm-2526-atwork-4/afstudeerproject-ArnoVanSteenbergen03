import { useState } from "react";
import { OperatingInfo, TimeRange } from "@shared/index";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

//validates the days from DAYS array
type DayKey = (typeof DAYS)[number];

//default hours when toggling a day on
const DEFAULT_HOURS: TimeRange = { open: "09:00", close: "17:00" };

//default operating info with all days closed for new distro centrers
const DEFAULT_OPERATING_INFO: OperatingInfo = {
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
};

// time formatting function for list display
export function formatTimeRange(range: TimeRange | null): string {
  if (!range) return "Closed";
  return `${range.open} - ${range.close}`;
}

// helper function for managing operating info state in forms
export function useOperatingInfo(initial?: OperatingInfo) {
  const [operatingInfo, setOperatingInfo] = useState<OperatingInfo>(
    initial ?? DEFAULT_OPERATING_INFO,
  );

  const toggleDay = (day: string) => {
    setOperatingInfo((prev) => ({
      ...prev,
      [day]: prev[day as DayKey] ? null : DEFAULT_HOURS,
    }));
  };

  const updateTime = (day: string, field: "open" | "close", value: string) => {
    setOperatingInfo((prev) => ({
      ...prev,
      [day]: prev[day as DayKey]
        ? { ...(prev[day as DayKey] as TimeRange), [field]: value }
        : { open: "", close: "" },
    }));
  };

  const getHours = (day: string): TimeRange | null => {
    return operatingInfo[day as DayKey];
  };

  return {
    operatingInfo,
    days: DAYS,
    toggleDay,
    updateTime,
    isDayOpen: (day: string) => operatingInfo[day as DayKey] !== null,
    getHours,
    formatTimeRange,
  };
}
