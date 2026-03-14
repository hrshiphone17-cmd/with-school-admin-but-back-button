// src/pages/student/VisualGame.tsx

import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { GameCanvas } from "@/components/game/GameCanvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, RotateCcw, Send } from "lucide-react";
import Editor from "@monaco-editor/react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const defaultInstructions = "Welcome to the Jungle Playground! 🦊\n\nUse commands to control the fox:\n• moveForward() — move one step\n• turnLeft() — turn left\n• turnRight() — turn right\n• collectItem() — pick up a banana\n\nCollect all 🍌 bananas and reach the 🏁 goal!";
const defaultCode = "// Control the fox!\nmoveForward()\nmoveForward()\nturnRight()\nmoveForward()\ncollectItem()";

const VisualGame = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exerciseId = searchParams.get("exercise");
  const sceneRef = useRef<any>(null);
  const { user, updateUser } = useAuth();

  const [exercise, setExercise] = useState<any>(null);
  const [code, setCode] = useState(defaultCode);
  const [log, setLog] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(!!exerciseId);

  // Fetch exercise from Supabase if exerciseId is present
  useEffect(() => {
    if (!exerciseId || !user) {
      setLoading(false);
      return;
    }

    const fetchExercise = async () => {
      const { data: exerciseData } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", exerciseId)
        .single();

      if (exerciseData) {
        setExercise(exerciseData);
        setCode(exerciseData.starter_code || defaultCode);
      }

      // Check if already completed
      const { data: completionData } = await supabase
        .from("completions")
        .select("id")
        .eq("student_id", user.id)
        .eq("exercise_id", exerciseId)
        .single();

      setSubmitted(!!completionData);
      setLoading(false);
    };

    fetchExercise();
  }, [exerciseId, user]);

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
      } else {
        newLog.push(`> ⚠️ Unknown command: ${trimmed}`);
      }
    });

    newLog.push("✅ Code executed!");
    setLog(newLog);
  };

  const handleReset = () => {
    sceneRef.current?.resetGame();
    setLog(["🔄 Game reset!"]);
  };

  const handleSubmit = async () => {
    if (!user || !exercise || submitted) return;

    // Run code first so student sees it execute
    handleRun();

    const { error } = await supabase.from("completions").insert({
      student_id: user.id,
      exercise_id: exercise.id,
      xp_earned: exercise.xp_reward,
    });

    if (!error) {
      const newXP = user.xp + exercise.xp_reward;
      const newLevel = Math.floor(newXP / 500) + 1;

      await supabase
        .from("users")
        .update({ xp: newXP, level: newLevel })
        .eq("id", user.id);

      updateUser({ xp: newXP, level: newLevel });
      setSubmitted(true);

      setLog((prev) => [
        ...prev,
        "",
        "🎉 Great job! Exercise completed!",
        `+${exercise.xp_reward} XP earned!`,
        `Total XP: ${newXP}`,
      ]);
    } else {
      setLog((prev) => [...prev, "❌ Error saving progress. Try again."]);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-muted rounded-2xl h-12 animate-pulse" />
          <div className="bg-muted rounded-2xl h-96 animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col animate-slide-up">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-fredoka text-xl font-bold">
                {exercise ? exercise.title : "Jungle Playground"} 🦊
              </h1>
              {exercise && (
                <p className="text-xs text-muted-foreground">
                  +{exercise.xp_reward} XP
                </p>
              )}
            </div>
          </div>
          {exercise && (
            <span className="text-sm font-bold text-primary">
              +{exercise.xp_reward} XP
            </span>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 min-h-0">

          {/* Left: Instructions */}
          <div className="bg-card rounded-2xl p-5 shadow-playful overflow-auto">
            <h2 className="font-fredoka text-lg font-bold mb-3">📋 Instructions</h2>
            <div className="whitespace-pre-line text-sm">
              {exercise?.instructions || defaultInstructions}
            </div>
            {exercise?.hints && exercise.hints.length > 0 && (
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

          {/* Center: Game Canvas + controls */}
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

            {/* Log output */}
            <div className="w-full bg-foreground/5 rounded-xl p-3 max-h-28 overflow-auto">
              {log.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Output will appear here...</p>
              ) : (
                log.map((l, i) => (
                  <p
                    key={i}
                    className={`text-xs font-mono ${
                      l.startsWith("🎉") || l.startsWith("✅")
                        ? "text-green-600 font-semibold"
                        : l.startsWith("❌")
                        ? "text-red-500 font-semibold"
                        : l.startsWith("⚠️")
                        ? "text-yellow-600"
                        : ""
                    }`}
                  >
                    {l}
                  </p>
                ))
              )}
            </div>

            {/* Submit button — only shown when opened from an exercise */}
            {exercise && (
              <Button
                className="w-full rounded-xl font-bold shadow-playful"
                onClick={handleSubmit}
                disabled={submitted}
              >
                <Send className="h-4 w-4 mr-1" />
                {submitted ? "✅ Submitted!" : "Submit"}
              </Button>
            )}
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