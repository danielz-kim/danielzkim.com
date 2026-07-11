import type { MetadataRoute } from "next";
import { getAllWork, getAllWriting } from "@/lib/mdx";

const BASE_URL = "https://danielzkim.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/work",
    "/writing",
    "/projects",
    "/play",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const workRoutes = getAllWork().map((study) => ({
    url: `${BASE_URL}/work/${study.slug}`,
    lastModified: new Date(study.date),
  }));

  const writingRoutes = getAllWriting().map((post) => ({
    url: `${BASE_URL}/writing/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [...staticRoutes, ...workRoutes, ...writingRoutes];
}
