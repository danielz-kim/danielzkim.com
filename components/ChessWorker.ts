export type Difficulty = "good" | "bad" | "speedrun";

interface EngineConfig {
  depth: number;
  randomMovePct: number;
}

const CONFIGS: Record<Difficulty, EngineConfig> = {
  good: { depth: 12, randomMovePct: 0 },
  bad: { depth: 6, randomMovePct: 0.05 },
  speedrun: { depth: 3, randomMovePct: 0.1 },
};

const INIT_TIMEOUT_MS = 15000;
const MOVE_TIMEOUT_MS = 8000;

export class StockfishEngine {
  private worker: Worker | null = null;
  private resolveMove: ((move: string) => void) | null = null;
  private rejectMove: ((err: Error) => void) | null = null;
  private ready = false;
  private busy = false;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Engine init timeout")),
        INIT_TIMEOUT_MS
      );

      try {
        this.worker = new Worker("/stockfish.js");

        this.worker.onmessage = (e: MessageEvent) => {
          const msg: string =
            typeof e.data === "string" ? e.data : String(e.data);

          if (msg === "uciok") {
            this.worker!.postMessage("isready");
          }

          if (msg === "readyok") {
            clearTimeout(timeout);
            this.ready = true;
            resolve();
          }

          if (msg.startsWith("bestmove")) {
            this.busy = false;
            const move = msg.split(" ")[1];
            if (this.resolveMove) {
              this.resolveMove(move === "(none)" ? "" : move);
              this.resolveMove = null;
              this.rejectMove = null;
            }
          }
        };

        this.worker.onerror = (e) => {
          clearTimeout(timeout);
          reject(new Error(e.message));
        };

        this.worker.postMessage("uci");
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  }

  async getBestMove(fen: string, difficulty: Difficulty): Promise<string> {
    if (!this.worker || !this.ready) throw new Error("Engine not ready");
    if (this.busy) throw new Error("Engine busy");

    const { depth, randomMovePct } = CONFIGS[difficulty];
    if (Math.random() < randomMovePct) return "";

    this.busy = true;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.busy = false;
        this.resolveMove = null;
        this.rejectMove = null;
        reject(new Error("Engine move timeout"));
      }, MOVE_TIMEOUT_MS);

      this.resolveMove = (move: string) => {
        clearTimeout(timeout);
        resolve(move);
      };

      this.rejectMove = (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      };

      this.worker!.postMessage(`position fen ${fen}`);
      this.worker!.postMessage(`go depth ${depth}`);
    });
  }

  destroy() {
    if (this.rejectMove) {
      this.rejectMove(new Error("Engine destroyed"));
      this.rejectMove = null;
      this.resolveMove = null;
    }
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.busy = false;
  }
}
