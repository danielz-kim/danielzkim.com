export interface CaseStudyFrontmatter {
  title: string;
  subtitle: string;
  company: string;
  slug: string;
  date: string;
  tags: string[];
  featured: boolean;
  coverImage?: string;
  readTime: string;
}

export interface WritingFrontmatter {
  title: string;
  date: string;
  tags: string[];
  readTime: string;
  excerpt: string;
}

export interface Project {
  name: string;
  kind: string;
  description: string;
  status: "profitable" | "live" | "active" | "in development" | "archived";
  stat?: string;
  tags: string[];
  url?: string;
  featured: boolean;
}

export interface CaseStudyMeta extends CaseStudyFrontmatter {
  slug: string;
}

export interface WritingMeta extends WritingFrontmatter {
  slug: string;
}

export interface WorkHistoryEntry {
  company: string;
  period: string;
  role: string;
  desc: string;
  type: string;
  badgeType: "dark" | "light";
  showBadge: boolean;
  caseStudy: boolean;
  href: string;
}
