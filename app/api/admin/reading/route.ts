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

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { books } = await readBooks();
  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { books, sha } = await readBooks();

  const base = slugify(`${body.title}-${body.author}`) || "book";
  let id = base;
  let n = 1;
  while (books.some((b) => b.id === id)) {
    id = `${base}-${++n}`;
  }

  const newBook: Book = {
    id,
    title: body.title,
    author: body.author,
    coverUrl: body.coverUrl || undefined,
    status: body.status,
    year: body.year ?? null,
    rating: body.rating ?? null,
    notes: body.notes ?? "",
    addedAt: new Date().toISOString(),
  };

  books.unshift(newBook);
  await putFile(readingFile, JSON.stringify(books, null, 2), `Add book: ${newBook.title}`, sha);
  return NextResponse.json({ success: true, id });
}
