import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Book } from "@/lib/types";

const readingFile = path.join(process.cwd(), "content", "reading.json");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids }: { ids: string[] } = await req.json();
  const books: Book[] = JSON.parse(fs.readFileSync(readingFile, "utf-8"));
  const byId = new Map(books.map((b) => [b.id, b]));

  const reordered = ids.map((id) => byId.get(id)).filter((b): b is Book => Boolean(b));
  for (const b of books) {
    if (!ids.includes(b.id)) reordered.push(b);
  }

  fs.writeFileSync(readingFile, JSON.stringify(reordered, null, 2));
  return NextResponse.json({ success: true });
}
