export interface DailyActivity {
  day: string;
  steps: number;
  activeCalories: number;
  totalCalories: number;
}

const BASE = "https://api.ouraring.com/v2/usercollection/daily_activity";

function dateISO(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

// Oura only publishes a day's summary once enough activity has synced from
// the ring, so "today" is often not ready yet — pull a short window and use
// whatever the most recent available day is.
export async function fetchTodayActivity(
  opts: { revalidate?: number } = {}
): Promise<DailyActivity | null> {
  const token = process.env.OURA_ACCESS_TOKEN;
  if (!token) return null;

  const start = dateISO(2);
  const end = dateISO(0);

  try {
    const res = await fetch(`${BASE}?start_date=${start}&end_date=${end}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: opts.revalidate ?? 900 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const latest = data.data?.[data.data.length - 1];
    if (!latest) return null;

    return {
      day: latest.day,
      steps: latest.steps,
      activeCalories: latest.active_calories,
      totalCalories: latest.total_calories,
    };
  } catch {
    return null;
  }
}
