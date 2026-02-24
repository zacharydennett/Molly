import { format, subWeeks, startOfWeek, endOfWeek, subYears, subDays } from "date-fns";

/** Returns Mon of the current or most recent completed week */
export function getLastMondayDate(): Date {
  const today = new Date();
  // If today is Monday, go back to last Monday
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...6=Sat
  const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysBack - 7);
  return lastMonday;
}

export interface WeekRange {
  start: string; // YYYY-MM-DD
  end: string;
  label: string;
}

export function getWeekRanges(): {
  lastWeek: WeekRange;
  previousWeek: WeekRange;
  sameWeekLastYear: WeekRange;
} {
  const today = new Date();
  // Start of last completed week (Mon)
  const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });

  const prevWeekStart = startOfWeek(subWeeks(today, 2), { weekStartsOn: 1 });
  const prevWeekEnd = endOfWeek(prevWeekStart, { weekStartsOn: 1 });

  const sameWeekLastYearStart = subYears(lastWeekStart, 1);
  const sameWeekLastYearEnd = subYears(lastWeekEnd, 1);

  return {
    lastWeek: {
      start: format(lastWeekStart, "yyyy-MM-dd"),
      end: format(lastWeekEnd, "yyyy-MM-dd"),
      label: `Week of ${format(lastWeekStart, "MMM d")}`,
    },
    previousWeek: {
      start: format(prevWeekStart, "yyyy-MM-dd"),
      end: format(prevWeekEnd, "yyyy-MM-dd"),
      label: `Week of ${format(prevWeekStart, "MMM d")}`,
    },
    sameWeekLastYear: {
      start: format(sameWeekLastYearStart, "yyyy-MM-dd"),
      end: format(sameWeekLastYearEnd, "yyyy-MM-dd"),
      label: `Week of ${format(sameWeekLastYearStart, "MMM d, yyyy")}`,
    },
  };
}

/** Convert a Date to CDC epiweek format YYYYWW */
export function toEpiweek(date: Date): number {
  // CDC epiweeks start on Sunday
  const start = new Date(date);
  const day = start.getDay(); // 0=Sun
  start.setDate(start.getDate() - day); // go to Sunday of this week

  const jan1 = new Date(start.getFullYear(), 0, 1);
  const jan1Day = jan1.getDay();
  const weekNum =
    Math.floor((start.getTime() - jan1.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  const adjustedWeek = jan1Day === 0 ? weekNum : weekNum;

  return start.getFullYear() * 100 + adjustedWeek;
}

export function getCurrentEpiweeks(): {
  thisWeek: number;
  lastWeek: number;
  sameWeekLastYear: number;
} {
  const today = new Date();
  const lastWeekDate = subWeeks(today, 1);
  const prevYearDate = subYears(lastWeekDate, 1);

  return {
    thisWeek: toEpiweek(today),
    lastWeek: toEpiweek(lastWeekDate),
    sameWeekLastYear: toEpiweek(prevYearDate),
  };
}

/** Returns the Wednesday of the most recently completed week at noon UTC. */
export function getPrevWeekWednesday(): Date {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun 1=Mon … 6=Sat
  // Days back to this week's Monday (Mon=0 offset)
  const daysToThisMonday = dow === 0 ? 6 : dow - 1;
  // Previous week's Monday
  const prevMonday = subDays(today, daysToThisMonday + 7);
  // Wednesday = Monday + 2
  const prevWed = new Date(prevMonday);
  prevWed.setDate(prevMonday.getDate() + 2);
  prevWed.setHours(12, 0, 0, 0);
  return prevWed;
}

/** Returns the Wednesday of the same week one year ago (52 weeks back, keeps day-of-week). */
export function getLastYearWednesday(): Date {
  const prevWed = getPrevWeekWednesday();
  const lastYear = subDays(prevWed, 364); // 52 weeks keeps same weekday
  lastYear.setHours(12, 0, 0, 0);
  return lastYear;
}

/** Converts a Date to Wayback Machine timestamp format: YYYYMMDDHHmmss */
export function toWaybackTimestamp(date: Date): string {
  return format(date, "yyyyMMddHHmmss");
}

export function formatWaybackTimestamp(ts: string): string {
  if (!ts || ts.length < 8) return "Unknown date";
  const year = ts.slice(0, 4);
  const month = ts.slice(4, 6);
  const day = ts.slice(6, 8);
  const hour = ts.length >= 10 ? ts.slice(8, 10) : "00";
  const min = ts.length >= 12 ? ts.slice(10, 12) : "00";
  try {
    const d = new Date(`${year}-${month}-${day}T${hour}:${min}:00`);
    return format(d, "MMM d, yyyy h:mm a");
  } catch {
    return `${year}-${month}-${day}`;
  }
}

export function getThisMondayLabel(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // Find this week's Monday
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday);
  return format(monday, "EEEE, MMMM d, yyyy");
}
