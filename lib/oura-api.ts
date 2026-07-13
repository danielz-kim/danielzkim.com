export interface DailyActivity {
  steps: number;
  activeCalories: number;
  totalCalories: number;
}

const BASE = "https://api.ouraring.com/v2/usercollection/daily_activity";

function todayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

export async function fetchTodayActivity(
  opts: { revalidate?: number } = {}
): Promise<DailyActivity | null> {
  const token = process.env.OURA_ACCESS_TOKEN;
  if (!token) return null;

  const date = todayISO();

  try {
    const res = await fetch(`${BASE}?start_date=${date}&end_date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: opts.revalidate ?? 900 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const today = data.data?.[data.data.length - 1];
    if (!today) return null;

    return {
      steps: today.steps,
      activeCalories: today.active_calories,
      totalCalories: today.total_calories,
    };
  } catch {
    return null;
  }
}
