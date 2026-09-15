import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { WorkHistoryEntry } from "@/lib/types";

const dataFile = path.join(process.cwd(), "content", "work-history.json");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries: WorkHistoryEntry[] = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
  return NextResponse.json(entries);
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries: WorkHistoryEntry[] = await req.json();
  if (!Array.isArray(entries)) {
    return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  }

  fs.writeFileSync(dataFile, JSON.stringify(entries, null, 2));
  return NextResponse.json({ success: true });
}
