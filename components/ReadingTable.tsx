"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Book } from "@/lib/types";

const COVER_WIDTH = 120;
const COVER_HEIGHT = COVER_WIDTH * 1.5;
const CURSOR_OFFSET = 20;

export default function ReadingTable({ books }: { books: Book[] }) {
  const [hover, setHover] = useState<{ book: Book; x: number; y: number } | null>(null);

  const handleMove = (book: Book) => (e: React.MouseEvent) => {
    if (!book.coverUrl) return;
    setHover({ book, x: e.clientX, y: e.clientY });
  };

  const clampedLeft =
    hover && typeof window !== "undefined"
      ? Math.min(hover.x + CURSOR_OFFSET, window.innerWidth - COVER_WIDTH - 16)
      : 0;

  const clampedTop =
    hover && typeof window !== "undefined"
      ? Math.min(
          Math.max(hover.y - COVER_HEIGHT / 2, 16),
          window.innerHeight - COVER_HEIGHT - 16
        )
      : 0;

  const gridCols =
    "grid-cols-[1fr_70px] sm:grid-cols-[1fr_140px_70px] md:grid-cols-[1fr_140px_90px_70px]";

  return (
    <div className="relative">
      <div className={`grid ${gridCols} gap-4 border-b border-border pb-2`}>
        <span className="label-meta font-normal text-tertiary">Title</span>
        <span className="label-meta font-normal text-tertiary hidden sm:block">
          Author
        </span>
        <span className="label-meta font-normal text-tertiary hidden md:block">
          Year
        </span>
        <span className="label-meta font-normal text-tertiary">Rating</span>
      </div>
      <div>
        {books.map((book) => (
          <div
            key={book.id}
            onMouseMove={handleMove(book)}
            onMouseLeave={() => setHover(null)}
            className={`grid ${gridCols} gap-4 items-center py-3 border-b border-border-faint last:border-b-0 hover:bg-tint transition-colors`}
          >
            <div>
              <p className="text-[15px] font-medium text-primary leading-snug">
                {book.title}
              </p>
              <p className="text-sm text-secondary sm:hidden">{book.author}</p>
            </div>
            <div className="text-sm text-secondary hidden sm:block">
              {book.author}
            </div>
            <div className="font-mono text-xs text-tertiary hidden md:block">
              {book.year ?? "—"}
            </div>
            <div className="font-mono text-xs text-primary">
              {book.rating ? "★".repeat(book.rating) : "—"}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {hover?.book.coverUrl && (
          <motion.div
            key={hover.book.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pointer-events-none fixed z-50"
            style={{ left: clampedLeft, top: clampedTop }}
          >
            <img
              src={hover.book.coverUrl}
              alt=""
              className="rounded-lg shadow-xl border border-border bg-border-faint object-cover"
              style={{ width: COVER_WIDTH, height: COVER_HEIGHT }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
