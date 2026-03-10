import { useEffect, useRef } from "react";
import Phaser from "phaser";

interface GameCanvasProps {
  onGameReady?: (scene: Phaser.Scene) => void;
  gridSize?: number;
}

const CELL_SIZE = 48;
const GRID_COLS = 8;
const GRID_ROWS = 6;

const walls = [
  { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
  { x: 5, y: 4 }, { x: 6, y: 4 },
];

const bananas = [
  { x: 2, y: 0 }, { x: 4, y: 2 }, { x: 6, y: 1 }, { x: 1, y: 4 },
];

const goal = { x: 7, y: 5 };
const foxStart = { x: 0, y: 0 };

class GridScene extends Phaser.Scene {
  fox: Phaser.GameObjects.Text | null = null;
  foxPos = { ...foxStart };
  foxDir = 0; // 0=right, 1=down, 2=left, 3=up
  collectedBananas: Set<string> = new Set();
  bananaObjects: Map<string, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super({ key: "GridScene" });
  }

  create() {
    // Draw grid
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const isWall = walls.some((w) => w.x === x && w.y === y);
        const color = isWall ? 0x8B7355 : (x + y) % 2 === 0 ? 0xB5EAD7 : 0xC8F0DC;
        this.add.rectangle(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE - 2, CELL_SIZE - 2, color).setStrokeStyle(1, 0xcccccc);
        if (isWall) {
          this.add.text(x * CELL_SIZE + 12, y * CELL_SIZE + 8, "🧱", { fontSize: "24px" });
        }
      }
    }

    // Bananas
    bananas.forEach((b) => {
      const key = `${b.x},${b.y}`;
      const txt = this.add.text(b.x * CELL_SIZE + 12, b.y * CELL_SIZE + 8, "🍌", { fontSize: "24px" });
      this.bananaObjects.set(key, txt);
    });

    // Goal flag
    this.add.text(goal.x * CELL_SIZE + 12, goal.y * CELL_SIZE + 8, "🏁", { fontSize: "24px" });

    // Fox
    this.fox = this.add.text(
      this.foxPos.x * CELL_SIZE + 12,
      this.foxPos.y * CELL_SIZE + 8,
      "🦊",
      { fontSize: "24px" }
    );

    // Expose methods
    (this as any).moveForward = () => this.moveForward();
    (this as any).turnLeft = () => this.turnLeft();
    (this as any).turnRight = () => this.turnRight();
    (this as any).collectItem = () => this.collectItem();
    (this as any).resetGame = () => this.resetGame();
  }

  moveForward() {
    const dirs = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
    const d = dirs[this.foxDir];
    const nx = this.foxPos.x + d.x;
    const ny = this.foxPos.y + d.y;

    if (nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS) return;
    if (walls.some((w) => w.x === nx && w.y === ny)) return;

    this.foxPos = { x: nx, y: ny };
    this.tweens.add({
      targets: this.fox,
      x: nx * CELL_SIZE + 12,
      y: ny * CELL_SIZE + 8,
      duration: 300,
      ease: "Power2",
    });
  }

  turnLeft() {
    this.foxDir = (this.foxDir + 3) % 4;
  }

  turnRight() {
    this.foxDir = (this.foxDir + 1) % 4;
  }

  collectItem() {
    const key = `${this.foxPos.x},${this.foxPos.y}`;
    const obj = this.bananaObjects.get(key);
    if (obj && !this.collectedBananas.has(key)) {
      this.collectedBananas.add(key);
      this.tweens.add({
        targets: obj,
        alpha: 0,
        scale: 2,
        duration: 300,
        onComplete: () => obj.destroy(),
      });
    }
  }

  resetGame() {
    this.scene.restart();
    this.foxPos = { ...foxStart };
    this.foxDir = 0;
    this.collectedBananas.clear();
  }
}

export function GameCanvas({ onGameReady }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GRID_COLS * CELL_SIZE,
      height: GRID_ROWS * CELL_SIZE,
      parent: containerRef.current,
      backgroundColor: "#f0f7f4",
      scene: GridScene,
      callbacks: {
        postBoot: (game) => {
          const scene = game.scene.getScene("GridScene");
          if (onGameReady && scene) {
            // Small delay to ensure scene is created
            setTimeout(() => onGameReady(scene), 500);
          }
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-2xl overflow-hidden shadow-playful border-4 border-mint"
      style={{ width: GRID_COLS * CELL_SIZE, height: GRID_ROWS * CELL_SIZE }}
    />
  );
}
