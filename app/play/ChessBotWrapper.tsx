"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { OpeningBook } from "@/lib/opening-book";

const ChessBot = dynamic(() => import("@/components/ChessBot"), {
  ssr: false,
});

interface PlayData {
  openingBook: OpeningBook;
  playerRating: number;
}

function BoardPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-[500px] bg-background border border-border rounded-lg flex items-center justify-center">
      <p className="text-sm text-tertiary">{children}</p>
    </div>
  );
}

export default function ChessBotWrapper() {
  const [data, setData] = useState<PlayData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/play-data")
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((json: PlayData) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <BoardPlaceholder>
        Couldn't load my game history from chess.com — try again shortly.
      </BoardPlaceholder>
    );
  }

  if (!data) {
    return <BoardPlaceholder>Loading my game history…</BoardPlaceholder>;
  }

  return (
    <>
      <p className="font-mono text-sm text-tertiary mb-4">
        current rating — {data.playerRating}
      </p>
      <ChessBot openingBook={data.openingBook} playerRating={data.playerRating} />
    </>
  );
}
