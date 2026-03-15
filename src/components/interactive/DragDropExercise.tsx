// src/components/interactive/DragDropExercise.tsx

import { useState, useRef } from "react";

interface DragDropExerciseProps {
  config: {
    emoji: string;
    label: string;
    targetEmoji: string;
    targetLabel: string;
    color: string;
  };
  onComplete: () => void;
}

export function DragDropExercise({ config, onComplete }: DragDropExerciseProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (completed) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || completed) return;
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    setPos({ x: newX, y: newY });

    // Check if over target
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const overTarget =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      setIsOver(overTarget);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || completed) return;
    setIsDragging(false);

    if (isOver) {
      setCompleted(true);
      setIsOver(false);
      setTimeout(() => onComplete(), 800);
    } else {
      // Snap back
      setPos({ x: 0, y: 0 });
      setIsOver(false);
    }
  };

  // Touch events for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (completed) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartPos.current = { x: touch.clientX - pos.x, y: touch.clientY - pos.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || completed) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStartPos.current.x;
    const newY = touch.clientY - dragStartPos.current.y;
    setPos({ x: newX, y: newY });

    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const overTarget =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;
      setIsOver(overTarget);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || completed) return;
    setIsDragging(false);

    if (isOver) {
      setCompleted(true);
      setIsOver(false);
      setTimeout(() => onComplete(), 800);
    } else {
      setPos({ x: 0, y: 0 });
      setIsOver(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-10 py-8 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {!completed ? (
        <>
          <p className="font-fredoka text-xl font-bold text-foreground animate-bounce">
            ✋ Drag the {config.label} to the {config.targetLabel}!
          </p>

          <div className="flex items-center justify-around w-full max-w-lg">
            {/* Draggable item */}
            <div
              ref={itemRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`
                flex items-center justify-center rounded-3xl shadow-2xl border-4 border-white
                cursor-grab active:cursor-grabbing transition-transform
                ${isDragging ? "scale-110 shadow-3xl z-50" : "hover:scale-105"}
              `}
              style={{
                width: 160,
                height: 160,
                backgroundColor: config.color,
                fontSize: 90,
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                position: isDragging ? "relative" : "relative",
                zIndex: isDragging ? 50 : 1,
                userSelect: "none",
                touchAction: "none",
              }}
            >
              {config.emoji}
            </div>

            <div className="text-4xl font-bold text-muted-foreground">→</div>

            {/* Drop target */}
            <div
              ref={targetRef}
              className={`
                flex items-center justify-center rounded-3xl border-4 transition-all
                ${isOver
                  ? "border-green-400 bg-green-100 scale-110 shadow-2xl"
                  : "border-dashed border-muted-foreground/40 bg-muted/30"
                }
              `}
              style={{
                width: 160,
                height: 160,
                fontSize: 90,
              }}
            >
              {config.targetEmoji}
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-fredoka">
            Hold and drag the {config.label} to the {config.targetLabel}
          </p>
        </>
      ) : (
        /* Success state */
        <div className="flex flex-col items-center gap-6 animate-bounce">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-3xl shadow-2xl border-4 border-green-400"
              style={{
                width: 160,
                height: 160,
                backgroundColor: config.color,
                fontSize: 90,
              }}
            >
              {config.emoji}
            </div>
            <span className="text-5xl">✅</span>
            <div
              className="flex items-center justify-center rounded-3xl shadow-2xl border-4 border-green-400 bg-green-50"
              style={{ width: 160, height: 160, fontSize: 90 }}
            >
              {config.targetEmoji}
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-6xl">🎉</p>
            <p className="font-fredoka text-3xl font-bold text-green-600">
              Perfect!
            </p>
            <p className="font-fredoka text-xl text-muted-foreground">
              You dragged the {config.label} to the {config.targetLabel}!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}