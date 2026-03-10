import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Button } from "@/components/ui/button";
import { mockCourses } from "@/data/mockCourses";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import Editor from "@monaco-editor/react";

const VisualGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exerciseId = searchParams.get("exercise");
  const sceneRef = useRef<any>(null);

  // Find exercise
  let exercise: any = null;
  for (const course of mockCourses) {
    for (const mod of course.modules) {
      const found = mod.exercises.find((e) => e.id === exerciseId);
      if (found) { exercise = found; break; }
    }
  }

  const defaultInstructions = "Welcome to the Jungle Playground! 🦊\n\nUse commands to control the fox:\n• moveForward() — move one step\n• turnLeft() — turn left\n• turnRight() — turn right\n• collectItem() — pick up a banana\n\nCollect all 🍌 bananas and reach the 🏁 goal!";
  const defaultCode = "// Control the fox!\nmoveForward()\nmoveForward()\nturnRight()\nmoveForward()\ncollectItem()";

  const [code, setCode] = useState(exercise?.starterCode || defaultCode);
  const [log, setLog] = useState<string[]>([]);

  const handleGameReady = (scene: any) => {
    sceneRef.current = scene;
  };

  const handleRun = () => {
    const scene = sceneRef.current;
    if (!scene) { setLog(["Game not ready yet..."]); return; }

    const lines = code.split("\n").filter((l: string) => l.trim() && !l.trim().startsWith("//"));
    const newLog: string[] = ["▶ Running code..."];

    let delay = 0;
    lines.forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed === "moveForward()") {
        setTimeout(() => scene.moveForward(), delay);
        newLog.push(`> moveForward()`);
        delay += 400;
      } else if (trimmed === "turnLeft()") {
        setTimeout(() => scene.turnLeft(), delay);
        newLog.push(`> turnLeft()`);
        delay += 200;
      } else if (trimmed === "turnRight()") {
        setTimeout(() => scene.turnRight(), delay);
        newLog.push(`> turnRight()`);
        delay += 200;
      } else if (trimmed === "collectItem()") {
        setTimeout(() => scene.collectItem(), delay);
        newLog.push(`> collectItem() 🍌`);
        delay += 300;
      }
    });

    newLog.push("✅ Code executed!");
    setLog(newLog);
  };

  const handleReset = () => {
    sceneRef.current?.resetGame();
    setLog(["🔄 Game reset!"]);
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-fredoka text-xl font-bold">
              {exercise ? exercise.title : "Jungle Playground"} 🦊
            </h1>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 min-h-0">
          {/* Left: Instructions */}
          <div className="bg-card rounded-2xl p-5 shadow-playful overflow-auto">
            <h2 className="font-fredoka text-lg font-bold mb-3">📋 Instructions</h2>
            <div className="whitespace-pre-line text-sm">
              {exercise?.instructions || defaultInstructions}
            </div>
            {exercise?.hints && (
              <div className="mt-4 bg-banana/30 rounded-xl p-3">
                <p className="font-semibold text-sm mb-2">💡 Hints:</p>
                <ul className="text-sm space-y-1">
                  {exercise.hints.map((h: string, i: number) => (
                    <li key={i}>• {h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Center: Game Canvas */}
          <div className="flex flex-col items-center gap-3">
            <GameCanvas onGameReady={handleGameReady} />
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl font-bold" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" /> Reset
              </Button>
              <Button className="rounded-xl font-bold shadow-playful" onClick={handleRun}>
                <Play className="h-4 w-4 mr-1" /> Run Code
              </Button>
            </div>
            {/* Log */}
            <div className="w-full bg-foreground/5 rounded-xl p-3 max-h-24 overflow-auto">
              {log.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Output will appear here...</p>
              ) : (
                log.map((l, i) => (
                  <p key={i} className="text-xs font-mono">{l}</p>
                ))
              )}
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="bg-card rounded-2xl shadow-playful overflow-hidden flex flex-col min-h-0">
            <div className="px-4 py-2 border-b border-border">
              <span className="text-sm font-fredoka font-bold">💻 Code Editor</span>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={(val) => setCode(val || "")}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default VisualGame;
