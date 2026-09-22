import { NextRequest, NextResponse } from "next/server";
import type { Book } from "@/lib/types";
import { getFile, putFile } from "@/lib/github-content";

const readingFile = "content/reading.json";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids }: { ids: string[] } = await req.json();
  const file = await getFile(readingFile);
  const books: Book[] = file ? JSON.parse(file.content) : [];
  const byId = new Map(books.map((b) => [b.id, b]));

  const reordered = ids.map((id) => byId.get(id)).filter((b): b is Book => Boolean(b));
  for (const b of books) {
    if (!ids.includes(b.id)) reordered.push(b);
  }

  await putFile(readingFile, JSON.stringify(reordered, null, 2), "Reorder reading list", file?.sha);
  return NextResponse.json({ success: true });
}
