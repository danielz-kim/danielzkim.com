export interface DailyActivity {
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
// the ring, so "today" is essentially never ready — we deliberately ask for
// yesterday, which is reliably finalized by the time this is read. Oura's
// end_date is exclusive, so we have to ask through "today" to get yesterday
// back at all.
export async function fetchYesterdayActivity(
  opts: { revalidate?: number } = {}
): Promise<DailyActivity | null> {
  const token = process.env.OURA_ACCESS_TOKEN;
  if (!token) return null;

  const start = dateISO(1);
  const end = dateISO(0);

  try {
    const res = await fetch(`${BASE}?start_date=${start}&end_date=${end}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: opts.revalidate ?? 900 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const activity = data.data?.[0];
    if (!activity) return null;

    return {
      steps: activity.steps,
      activeCalories: activity.active_calories,
      totalCalories: activity.total_calories,
    };
  } catch {
    return null;
  }
}
