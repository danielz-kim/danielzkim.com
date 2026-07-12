import { NextRequest, NextResponse } from "next/server";
import { backfillFromGames } from "@/lib/chess-history";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const months = Number(req.nextUrl.searchParams.get("months")) || 12;
  const counts = await backfillFromGames(months);
  if (!counts) {
    return NextResponse.json(
      { error: "Redis not configured (missing KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN)" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, counts });
}
