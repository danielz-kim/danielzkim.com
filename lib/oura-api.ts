export interface DailyActivity {
  steps: number;
  activeCalories: number;
  totalCalories: number;
}

const BASE = "https://api.ouraring.com/v2/usercollection/daily_activity";

function dateISO(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

// Oura only publishes a day's summary once enough activity has synced from
// the ring, so "today" often isn't ready — pull a short window and use
// whatever the most recent available day is (today if it's synced, else it
// naturally falls back further back). Oura's end_date is exclusive, so we
// query through tomorrow to make today's date actually reachable.
export async function fetchLatestActivity(
  opts: { revalidate?: number } = {}
): Promise<DailyActivity | null> {
  const token = process.env.OURA_ACCESS_TOKEN;
  if (!token) return null;

  const start = dateISO(-3);
  const end = dateISO(1);

  try {
    const res = await fetch(`${BASE}?start_date=${start}&end_date=${end}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: opts.revalidate ?? 300 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const latest = data.data?.[data.data.length - 1];
    if (!latest) return null;

    return {
      steps: latest.steps,
      activeCalories: latest.active_calories,
      totalCalories: latest.total_calories,
    };
  } catch {
    return null;
  }
}
