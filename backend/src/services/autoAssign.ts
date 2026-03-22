import { db } from "@/config/database";
import { places } from "@/db/schema";
import { eq } from "drizzle-orm";

// Day names matching JS Date.getDay()
const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/**
 * Find a distribution center that is open at the given orderTime.
 * Queries all places with type "distribution_center", checks their
 * operatingInfo for the day of the week, and filters to those where
 * the order time falls within their open/close window.
 *
 * Returns the place ID of a randomly selected open center, or null if none are open.
 */
export async function findOpenCenter(orderTime: Date): Promise<string | null> {
  const centers = await db
    .select()
    .from(places)
    .where(eq(places.type, "distribution_center"));

  if (centers.length === 0) return null;

  const dayName = DAY_NAMES[orderTime.getDay()];
  const timeStr =
    String(orderTime.getHours()).padStart(2, "0") +
    ":" +
    String(orderTime.getMinutes()).padStart(2, "0");

  const openCenters = centers.filter((center) => {
    const opInfo = center.operatingInfo as Record<string, any> | null;
    if (!opInfo) return false;

    const daySchedule = opInfo[dayName];
    if (!daySchedule) return false;

    const { open, close } = daySchedule;
    return timeStr >= open && timeStr < close;
  });

  if (openCenters.length === 0) return null;

  //TODO: Geolocation shortest route // map package: openstreet, mapops, free credits api
  //TODO: acceptance hours // outside of normal opening hours. we can also have acceptance hour

  // Pick a random open center
  const picked = openCenters[Math.floor(Math.random() * openCenters.length)];
  return picked.id;
}
