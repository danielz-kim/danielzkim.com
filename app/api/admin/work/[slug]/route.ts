import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content", "work");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

function safeSlug(slug: string) {
  return slug.replace(/[^a-z0-9-]/g, "");
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filePath = path.join(contentDir, `${safeSlug(params.slug)}.mdx`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
  return NextResponse.json({ frontmatter: data, content });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filePath = path.join(contentDir, `${safeSlug(params.slug)}.mdx`);
  const { frontmatter, content } = await req.json();
  fs.writeFileSync(filePath, matter.stringify(content ?? "", frontmatter));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filePath = path.join(contentDir, `${safeSlug(params.slug)}.mdx`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  fs.unlinkSync(filePath);
  return NextResponse.json({ success: true });
}
