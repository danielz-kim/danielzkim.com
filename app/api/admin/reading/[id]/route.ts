import { NextRequest, NextResponse } from "next/server";
import type { Book } from "@/lib/types";
import { getFile, putFile } from "@/lib/github-content";

const readingFile = "content/reading.json";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

async function readBooks(): Promise<{ books: Book[]; sha?: string }> {
  const file = await getFile(readingFile);
  return { books: file ? JSON.parse(file.content) : [], sha: file?.sha };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { books, sha } = await readBooks();
  const idx = books.findIndex((b) => b.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  books[idx] = {
    ...books[idx],
    title: body.title,
    author: body.author,
    coverUrl: body.coverUrl || undefined,
    status: body.status,
    year: body.year ?? null,
    rating: body.rating ?? null,
    notes: body.notes ?? "",
  };
  await putFile(readingFile, JSON.stringify(books, null, 2), `Update book: ${books[idx].title}`, sha);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { books, sha } = await readBooks();
  const idx = books.findIndex((b) => b.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [removed] = books.splice(idx, 1);
  await putFile(readingFile, JSON.stringify(books, null, 2), `Delete book: ${removed.title}`, sha);
  return NextResponse.json({ success: true });
}
