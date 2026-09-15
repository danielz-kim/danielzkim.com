import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Book } from "@/lib/types";

const readingFile = path.join(process.cwd(), "content", "reading.json");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

function readBooks(): Book[] {
  return JSON.parse(fs.readFileSync(readingFile, "utf-8"));
}

function writeBooks(books: Book[]) {
  fs.writeFileSync(readingFile, JSON.stringify(books, null, 2));
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

  return NextResponse.json(readBooks());
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const books = readBooks();

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
  writeBooks(books);
  return NextResponse.json({ success: true, id });
}
