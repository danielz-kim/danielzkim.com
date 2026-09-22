import { NextRequest, NextResponse } from "next/server";
import type { WorkHistoryEntry } from "@/lib/types";
import { getFile, putFile } from "@/lib/github-content";

const dataFile = "content/work-history.json";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = await getFile(dataFile);
  const entries: WorkHistoryEntry[] = file ? JSON.parse(file.content) : [];
  return NextResponse.json(entries);
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries: WorkHistoryEntry[] = await req.json();
  if (!Array.isArray(entries)) {
    return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  }

  const existing = await getFile(dataFile);
  await putFile(dataFile, JSON.stringify(entries, null, 2), "Update work history", existing?.sha);
  return NextResponse.json({ success: true });
}
