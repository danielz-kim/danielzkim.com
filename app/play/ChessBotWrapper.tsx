"use client";

import dynamic from "next/dynamic";
import type { OpeningBook } from "@/lib/opening-book";

const ChessBot = dynamic(() => import("@/components/ChessBot"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-background border border-border rounded-lg flex items-center justify-center">
      <p className="text-sm text-tertiary">Loading board...</p>
    </div>
  ),
});

interface Props {
  openingBook: OpeningBook;
  playerRating: number;
}

export default function ChessBotWrapper({ openingBook, playerRating }: Props) {
  return <ChessBot openingBook={openingBook} playerRating={playerRating} />;
}
