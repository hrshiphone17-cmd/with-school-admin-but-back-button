// src/components/interactive/InteractiveExerciseRenderer.tsx

import { TapExercise } from "./TapExercise";
import { DragDropExercise } from "./DragDropExercise";

interface InteractiveExerciseRendererProps {
  interactionConfig: any;
  onComplete: () => void;
}

export function InteractiveExerciseRenderer({
  interactionConfig,
  onComplete,
}: InteractiveExerciseRendererProps) {
  if (!interactionConfig) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No interaction config found for this exercise.</p>
      </div>
    );
  }

  const { interactionType } = interactionConfig;

  if (interactionType === "tap") {
    return <TapExercise config={interactionConfig} onComplete={onComplete} />;
  }

  if (interactionType === "drag") {
    return <DragDropExercise config={interactionConfig} onComplete={onComplete} />;
  }

  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <p>Unknown interaction type: {interactionType}</p>
    </div>
  );
}