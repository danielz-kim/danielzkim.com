import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { CaseStudyMeta, WritingMeta } from "./types";

const contentDir = path.join(process.cwd(), "content");

function getFiles(dir: string): string[] {
  const fullDir = path.join(contentDir, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir).filter((f) => f.endsWith(".mdx"));
}

export function getAllWork(): CaseStudyMeta[] {
  const files = getFiles("work");
  return files
    .map((filename) => {
      const slug = filename.replace(".mdx", "");
      const raw = fs.readFileSync(
        path.join(contentDir, "work", filename),
        "utf-8"
      );
      const { data } = matter(raw);
      return { ...(data as CaseStudyMeta), slug };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getFeaturedWork(): CaseStudyMeta[] {
  return getAllWork().filter((w) => w.featured);
}

export function getWorkBySlug(slug: string): {
  meta: CaseStudyMeta;
  content: string;
} {
  const raw = fs.readFileSync(
    path.join(contentDir, "work", `${slug}.mdx`),
    "utf-8"
  );
  const { data, content } = matter(raw);
  return { meta: { ...(data as CaseStudyMeta), slug }, content };
}

export function getAllWriting(): WritingMeta[] {
  const files = getFiles("writing");
  return files
    .map((filename) => {
      const slug = filename.replace(".mdx", "");
      const raw = fs.readFileSync(
        path.join(contentDir, "writing", filename),
        "utf-8"
      );
      const { data } = matter(raw);
      return { ...(data as WritingMeta), slug };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getWritingBySlug(slug: string): {
  meta: WritingMeta;
  content: string;
} {
  const raw = fs.readFileSync(
    path.join(contentDir, "writing", `${slug}.mdx`),
    "utf-8"
  );
  const { data, content } = matter(raw);
  return { meta: { ...(data as WritingMeta), slug }, content };
}
