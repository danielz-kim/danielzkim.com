"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Chessboard } from "react-chessboard";
type PieceDropHandlerArgs = { piece: unknown; sourceSquare: string; targetSquare: string | null };
import { Chess } from "chess.js";
import { clsx } from "clsx";
import type { OpeningBook } from "@/lib/opening-book";
import { getBookMove } from "@/lib/opening-book";
import { StockfishEngine, type Difficulty } from "./ChessWorker";

interface Props {
  openingBook: OpeningBook;
  playerRating: number;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  good: "Daniel on a good day",
  bad: "Daniel on a bad day",
  speedrun: "Daniel speed-running elo",
};

const GAME_OVER_MESSAGES: Record<string, string[]> = {
  checkmate_win: [
    "I let you win. Definitely.",
    "Okay that was embarrassing.",
    "I've been playing worse since the algorithm update.",
  ],
  checkmate_loss: [
    "That's more like it.",
    "You played like me on a good day.",
    "Rematch?",
  ],
  draw: [
    "I'll take it.",
    "Classic. Neither of us wants to commit.",
    "A draw is just a loss you haven't lost yet.",
  ],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ChessBot({ openingBook, playerRating }: Props) {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(new Chess().fen());
  const [difficulty, setDifficulty] = useState<Difficulty>("bad");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [isThinking, setIsThinking] = useState(false);
  const [gameOverMsg, setGameOverMsg] = useState<string | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [engineError, setEngineError] = useState(false);
  const engineRef = useRef<StockfishEngine | null>(null);

  useEffect(() => {
    const engine = new StockfishEngine();
    engineRef.current = engine;
    engine.init().catch(() => setEngineError(true));
    return () => engine.destroy();
  }, []);

  const checkGameOver = useCallback(
    (g: Chess, justMoved: "player" | "bot") => {
      if (!g.isGameOver()) return;
      let key: string;
      if (g.isCheckmate()) {
        key = justMoved === "bot" ? "checkmate_loss" : "checkmate_win";
      } else {
        key = "draw";
      }
      setGameOverMsg(randomFrom(GAME_OVER_MESSAGES[key]));
    },
    []
  );

  const makeBotMove = useCallback(
    async (currentGame: Chess) => {
      if (currentGame.isGameOver()) return;
      setIsThinking(true);

      try {
        const currentFen = currentGame.fen();

        // Try opening book first
        const bookMove = getBookMove(
          openingBook,
          currentFen,
          difficulty === "good" ? 0.85 : 0.6
        );

        let san: string | null = null;

        if (bookMove) {
          try {
            const g2 = new Chess(currentFen);
            const result = g2.move(bookMove);
            if (result) san = result.san;
          } catch {
            // fall through to engine
          }
        }

        if (!san && engineRef.current) {
          const uciMove = await engineRef.current.getBestMove(
            currentFen,
            difficulty
          );

          const g2 = new Chess(currentFen);
          if (uciMove && uciMove.length >= 4) {
            const from = uciMove.slice(0, 2) as any;
            const to = uciMove.slice(2, 4) as any;
            const promotion = uciMove.length === 5 ? uciMove[4] : undefined;
            try {
              const result = g2.move({ from, to, promotion });
              if (result) san = result.san;
            } catch {
              // fall through
            }
          }

          // Fallback: random legal move
          if (!san) {
            const moves = g2.moves();
            if (moves.length > 0) {
              const result = g2.move(moves[Math.floor(Math.random() * moves.length)]);
              if (result) san = result.san;
            }
          }
        }

        if (san) {
          const newGame = new Chess(currentFen);
          newGame.move(san);
          setGame(newGame);
          setFen(newGame.fen());
          setMoveHistory((h) => [...h, san!]);
          checkGameOver(newGame, "bot");
        }
      } catch (err) {
        // Engine timed out or errored — play a random legal move so the game never gets stuck
        console.warn("Engine error, falling back to random move:", err);
        try {
          const g2 = new Chess(currentGame.fen());
          const moves = g2.moves();
          if (moves.length > 0) {
            const result = g2.move(moves[Math.floor(Math.random() * moves.length)]);
            if (result) {
              setGame(g2);
              setFen(g2.fen());
              setMoveHistory((h) => [...h, result.san]);
              checkGameOver(g2, "bot");
            }
          }
        } catch {
          // nothing to do
        }
      } finally {
        setIsThinking(false);
      }
    },
    [difficulty, openingBook, checkGameOver]
  );

  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (isThinking || gameOverMsg) return false;
      if (!targetSquare) return false;
      if (game.turn() !== playerColor[0]) return false;

      try {
        const newGame = new Chess(game.fen());
        const move = newGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
        if (!move) return false;

        setGame(newGame);
        setFen(newGame.fen());
        setMoveHistory((h) => [...h, move.san]);
        checkGameOver(newGame, "player");

        if (!newGame.isGameOver()) {
          setTimeout(() => makeBotMove(newGame), 300);
        }
        return true;
      } catch {
        return false;
      }
    },
    [game, isThinking, gameOverMsg, playerColor, makeBotMove, checkGameOver]
  );

  const newGame = useCallback(() => {
    const g = new Chess();
    setGame(g);
    setFen(g.fen());
    setMoveHistory([]);
    setGameOverMsg(null);
    setIsThinking(false);

    if (playerColor === "black") {
      setTimeout(() => makeBotMove(g), 400);
    }
  }, [playerColor, makeBotMove]);

  const flipColor = () => {
    setPlayerColor((c) => (c === "white" ? "black" : "white"));
    newGame();
  };

  // Format move history into pairs
  const movePairs: [string, string | undefined][] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push([moveHistory[i], moveHistory[i + 1]]);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Board column */}
      <div className="w-full lg:w-[480px] shrink-0">
        {/* Opponent card */}
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-mono">
            DK
          </div>
          <div>
            <p className="text-sm text-primary font-medium">Daniel (bot)</p>
            <p className="text-xs text-tertiary">~{playerRating} Elo</p>
          </div>
          {isThinking && (
            <span className="ml-auto text-xs text-tertiary animate-pulse">
              thinking...
            </span>
          )}
        </div>

        {/* Chess board */}
        <div className="rounded-lg overflow-hidden border border-border">
          <Chessboard
            options={{
              position: fen,
              onPieceDrop: onDrop,
              boardOrientation: playerColor,
              boardStyle: { borderRadius: 0 },
              darkSquareStyle: { backgroundColor: "#b7c0d8" },
              lightSquareStyle: { backgroundColor: "#e8edf9" },
              allowDragging: !isThinking && !gameOverMsg,
            }}
          />
        </div>

        {/* Player card */}
        <div className="flex items-center gap-3 mt-3 px-1">
          <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-xs text-tertiary">
            You
          </div>
          <div>
            <p className="text-sm text-primary">You</p>
            <p className="text-xs text-tertiary capitalize">{playerColor}</p>
          </div>
        </div>

        {/* Game over message */}
        {gameOverMsg && (
          <div className="mt-4 p-4 bg-background border border-border rounded-lg">
            <p className="text-sm text-primary italic">"{gameOverMsg}"</p>
          </div>
        )}

        {/* Engine error */}
        {engineError && (
          <div className="mt-4 p-3 bg-background border border-border rounded-lg">
            <p className="text-xs text-tertiary">
              Stockfish didn't load — moves will be random.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="flex-1 min-w-0">
        {/* Difficulty */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-tertiary mb-3">
            Difficulty
          </p>
          <div className="flex flex-col gap-2">
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={clsx(
                  "text-left px-4 py-2.5 rounded-lg border text-sm transition-colors",
                  difficulty === d
                    ? "border-primary text-primary bg-background"
                    : "border-border text-secondary hover:border-faint"
                )}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={newGame}
            className="text-sm px-4 py-2 border border-border rounded-lg text-secondary hover:text-primary hover:border-faint transition-colors"
          >
            New game
          </button>
          <button
            onClick={flipColor}
            className="text-sm px-4 py-2 border border-border rounded-lg text-secondary hover:text-primary hover:border-faint transition-colors"
          >
            Flip color
          </button>
        </div>

        {/* Move history */}
        <div>
          <p className="text-xs uppercase tracking-widest text-tertiary mb-3">
            Moves
          </p>
          <div className="font-mono text-xs max-h-64 overflow-y-auto space-y-1">
            {movePairs.length === 0 && (
              <p className="text-tertiary">No moves yet.</p>
            )}
            {movePairs.map(([white, black], i) => (
              <div key={i} className="flex gap-4">
                <span className="text-tertiary w-6">{i + 1}.</span>
                <span className="text-primary w-14">{white}</span>
                <span className="text-secondary">{black ?? ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
