// All "today" and "this month" logic uses UK time, so a payment made at 11pm
// on the last day of the month counts towards that month.

const TIME_ZONE = "Europe/London";

export type LondonDate = {
  year: number;
  month: number; // 1-12
  day: number;
  daysInMonth: number;
  iso: string; // YYYY-MM-DD
};

export function londonToday(now: Date = new Date()): LondonDate {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);

  const year = get("year");
  const month = get("month");
  const day = get("day");

  return {
    year,
    month,
    day,
    daysInMonth: new Date(Date.UTC(year, month, 0)).getUTCDate(),
    iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

// First day of the month and first day of the next month, as YYYY-MM-DD.
// Use as: occurred_on >= start AND occurred_on < end.
export function monthRange(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return {
    start: `${year}-${pad(month)}-01`,
    end: `${nextYear}-${pad(nextMonth)}-01`,
  };
}

// True for a real calendar date written as YYYY-MM-DD.
export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
