import { NextRequest, NextResponse } from "next/server";
import { recordSnapshot } from "@/lib/chess-history";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const ok = await recordSnapshot();
  if (!ok) {
    return NextResponse.json(
      { error: "Redis not configured (missing KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN)" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
