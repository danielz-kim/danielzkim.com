"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/types";

const PREVIEW_WIDTH = 340;
const PREVIEW_HEIGHT = (PREVIEW_WIDTH * 9) / 16;
const CURSOR_OFFSET = 24;

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [hover, setHover] = useState<{ project: Project; x: number; y: number } | null>(null);

  const handleMove = (project: Project) => (e: React.MouseEvent) => {
    if (!project.previewImage) return;
    setHover({ project, x: e.clientX, y: e.clientY });
  };

  const clampedLeft =
    hover && typeof window !== "undefined"
      ? Math.min(hover.x + CURSOR_OFFSET, window.innerWidth - PREVIEW_WIDTH - 16)
      : 0;

  const clampedTop =
    hover && typeof window !== "undefined"
      ? Math.min(
          Math.max(hover.y - PREVIEW_HEIGHT / 2, 16),
          window.innerHeight - PREVIEW_HEIGHT - 16
        )
      : 0;

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project, i) => (
          <FadeIn key={project.name} delay={i * 0.08}>
            <div onMouseMove={handleMove(project)} onMouseLeave={() => setHover(null)}>
              <ProjectCard project={project} />
            </div>
          </FadeIn>
        ))}
      </div>

      <AnimatePresence>
        {hover?.project.previewImage && (
          <motion.div
            key={hover.project.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pointer-events-none fixed z-50"
            style={{ left: clampedLeft, top: clampedTop }}
          >
            <img
              src={hover.project.previewImage}
              alt=""
              className="rounded-lg shadow-xl border border-border bg-border-faint object-cover"
              style={{ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
