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

  return (
    <div className="relative">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="label-meta font-normal text-tertiary pb-2 pr-4">Title</th>
            <th className="label-meta font-normal text-tertiary pb-2 pr-4 hidden sm:table-cell">
              Author
            </th>
            <th className="label-meta font-normal text-tertiary pb-2 pr-4 hidden md:table-cell">
              Year
            </th>
            <th className="label-meta font-normal text-tertiary pb-2">Rating</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr
              key={book.id}
              onMouseMove={handleMove(book)}
              onMouseLeave={() => setHover(null)}
              className="border-b border-border-faint last:border-b-0 hover:bg-tint transition-colors"
            >
              <td className="py-3 pr-4">
                <p className="text-[15px] font-medium text-primary leading-snug">
                  {book.title}
                </p>
                <p className="text-sm text-secondary sm:hidden">{book.author}</p>
              </td>
              <td className="py-3 pr-4 text-sm text-secondary hidden sm:table-cell">
                {book.author}
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-tertiary hidden md:table-cell">
                {book.year ?? "—"}
              </td>
              <td className="py-3 font-mono text-xs text-primary">
                {book.rating ? "★".repeat(book.rating) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
