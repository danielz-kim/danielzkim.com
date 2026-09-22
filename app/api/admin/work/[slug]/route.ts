import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { getFile, putFile, deleteFile } from "@/lib/github-content";

const contentDir = "content/work";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

function safeSlug(slug: string) {
  return slug.replace(/[^a-z0-9-]/g, "");
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = await getFile(`${contentDir}/${safeSlug(params.slug)}.mdx`);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, content } = matter(file.content);
  return NextResponse.json({ frontmatter: data, content });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filePath = `${contentDir}/${safeSlug(params.slug)}.mdx`;
  const { frontmatter, content } = await req.json();
  const existing = await getFile(filePath);
  await putFile(
    filePath,
    matter.stringify(content ?? "", frontmatter),
    `Update work case study: ${params.slug}`,
    existing?.sha
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filePath = `${contentDir}/${safeSlug(params.slug)}.mdx`;
  const existing = await getFile(filePath);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteFile(filePath, `Delete work case study: ${params.slug}`, existing.sha);
  return NextResponse.json({ success: true });
}
