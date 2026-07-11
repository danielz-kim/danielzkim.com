import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content", "work");

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
  const items = files
    .map((filename) => {
      const slug = filename.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(contentDir, filename), "utf-8");
      const { data } = matter(raw);
      return { slug, ...data };
    })
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { frontmatter, content, slug } = await req.json();
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const filePath = path.join(contentDir, `${safeSlug}.mdx`);

  if (fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  fs.writeFileSync(filePath, matter.stringify(content ?? "", frontmatter));
  return NextResponse.json({ success: true, slug: safeSlug });
}
