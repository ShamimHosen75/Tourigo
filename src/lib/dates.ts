const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const full = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const dayLabel = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function formatRange(start: string, end: string) {
  return start === end ? full.format(parse(start)) : `${full.format(parse(start))} – ${short.format(parse(end))}`;
}

export function formatDate(iso: string) {
  return full.format(parse(iso));
}

/** "FRI, OCT 23, 2026" for day N of a trip starting on `start` (day 0 = departure night). */
export function tripDayLabel(start: string, dayIndex: number) {
  const d = parse(start);
  d.setUTCDate(d.getUTCDate() + Math.max(0, dayIndex));
  return dayLabel.format(d).toUpperCase();
}
