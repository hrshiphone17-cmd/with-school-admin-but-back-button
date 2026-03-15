// src/components/interactive/TapExercise.tsx

import { useState } from "react";

interface TapExerciseProps {
  config: {
    emoji: string;
    label: string;
    color: string;
  };
  onComplete: () => void;
}

export function TapExercise({ config, onComplete }: TapExerciseProps) {
  const [tapped, setTapped] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleTap = () => {
    if (tapped || animating) return;
    setAnimating(true);

    setTimeout(() => {
      setTapped(true);
      setAnimating(false);
      onComplete();
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8 select-none">
      {!tapped ? (
        <>
          {/* Big tappable object */}
          <button
            onClick={handleTap}
            className={`
              flex items-center justify-center rounded-3xl shadow-2xl border-4 border-white
              transition-all duration-150 active:scale-95 cursor-pointer
              ${animating ? "scale-110" : "hover:scale-105"}
            `}
            style={{
              width: 220,
              height: 220,
              backgroundColor: config.color,
              fontSize: 120,
            }}
          >
            {config.emoji}
          </button>

          {/* Pulsing tap hint */}
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-4xl">👆</span>
            <p className="font-fredoka text-xl font-bold text-foreground">
              Tap the {config.label}!
            </p>
          </div>
        </>
      ) : (
        /* Success state */
        <div className="flex flex-col items-center gap-6 animate-bounce">
          <div
            className="flex items-center justify-center rounded-3xl shadow-2xl border-4 border-green-400"
            style={{
              width: 220,
              height: 220,
              backgroundColor: config.color,
              fontSize: 120,
            }}
          >
            {config.emoji}
          </div>
          <div className="text-center space-y-2">
            <p className="text-6xl">🎉</p>
            <p className="font-fredoka text-3xl font-bold text-green-600">
              Great job!
            </p>
            <p className="font-fredoka text-xl text-muted-foreground">
              You tapped the {config.label}!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}