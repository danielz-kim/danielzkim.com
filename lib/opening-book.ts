import { Chess } from "chess.js";

export type OpeningBook = Record<string, Record<string, number>>;

const USERNAME = "dbossehc";

function getHeader(pgn: string, key: string): string {
  const match = pgn.match(new RegExp(`\\[${key}\\s+"([^"]+)"\\]`));
  return match ? match[1] : "";
}

function extractMoves(pgn: string): string[] {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return [];
  }
  return chess.history();
}

export function buildOpeningBook(pgns: string[], maxDepth = 6): OpeningBook {
  const book: OpeningBook = {};

  for (const pgn of pgns) {
    const white = getHeader(pgn, "White");
    const black = getHeader(pgn, "Black");
    const isWhite = white.toLowerCase() === USERNAME.toLowerCase();
    const isBlack = black.toLowerCase() === USERNAME.toLowerCase();
    if (!isWhite && !isBlack) continue;

    const moves = extractMoves(pgn);
    if (moves.length === 0) continue;

    const chess = new Chess();
    for (let i = 0; i < Math.min(moves.length, maxDepth * 2); i++) {
      const isPlayerTurn = isWhite ? i % 2 === 0 : i % 2 === 1;
      if (!isPlayerTurn) {
        chess.move(moves[i]);
        continue;
      }

      const fen = chess.fen();
      const move = moves[i];
      if (!book[fen]) book[fen] = {};
      book[fen][move] = (book[fen][move] ?? 0) + 1;
      chess.move(move);
    }
  }

  return book;
}

export function getBookMove(
  book: OpeningBook,
  fen: string,
  followRate = 0.8
): string | null {
  const position = book[fen];
  if (!position) return null;
  if (Math.random() > followRate) return null;

  const entries = Object.entries(position);
  if (entries.length === 0) return null;

  // Pick a move weighted by how often it was played
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  let rand = Math.random() * total;
  for (const [move, count] of entries) {
    rand -= count;
    if (rand <= 0) return move;
  }
  return entries[0][0];
}
