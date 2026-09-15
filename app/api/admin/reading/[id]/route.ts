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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const books = readBooks();
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
  writeBooks(books);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const books = readBooks();
  const idx = books.findIndex((b) => b.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  books.splice(idx, 1);
  writeBooks(books);
  return NextResponse.json({ success: true });
}
