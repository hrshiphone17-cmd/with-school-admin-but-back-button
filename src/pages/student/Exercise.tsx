// src/pages/student/Exercise.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Play, Send, ChevronDown, ChevronUp } from "lucide-react";
import Editor from "@monaco-editor/react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { InteractiveExerciseRenderer } from "@/components/interactive/InteractiveExerciseRenderer";

const Exercise = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [exercise, setExercise] = useState<any>(null);
  const [courseName, setCourseName] = useState("");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!exerciseId || !user) return;

    const fetchExercise = async () => {
      const { data: exerciseData } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", exerciseId)
        .single();

      if (!exerciseData) { setLoading(false); return; }

      const { data: moduleData } = await supabase
        .from("modules")
        .select("*, courses(title)")
        .eq("id", exerciseData.module_id)
        .single();

      if (moduleData?.courses) {
        setCourseName(moduleData.courses.title);
      }

      const { data: completionData } = await supabase
        .from("completions")
        .select("id")
        .eq("student_id", user.id)
        .eq("exercise_id", exerciseId)
        .single();

      setExercise(exerciseData);
      setCode(exerciseData.starter_code || "");
      setSubmitted(!!completionData);
      setLoading(false);
    };

    fetchExercise();
  }, [exerciseId, user]);

  // ── Shared XP completion handler (used by all exercise types) ──
  const handleComplete = async () => {
    if (!user || !exercise || submitted) return;

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
    }
  };

  // ── Code exercise: Run ──
  const handleRun = () => {
    setRunning(true);
    const logs: string[] = [];

    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      logs.push(
        args.map((a) => {
          if (typeof a === "object") {
            try { return JSON.stringify(a, null, 2); }
            catch { return String(a); }
          }
          return String(a);
        }).join(" ")
      );
    };
    console.error = (...args) => { logs.push("❌ " + args.map(String).join(" ")); };
    console.warn = (...args) => { logs.push("⚠️ " + args.map(String).join(" ")); };

    try {
      const print = (...args: any[]) => console.log(...args);
      // eslint-disable-next-line no-new-func
      const fn = new Function("print", code);
      fn(print);

      if (logs.length === 0) {
        logs.push("✅ Code ran successfully (no output)");
        logs.push("💡 Tip: Use console.log() or print() to see values");
      } else {
        logs.push("✅ Done!");
      }
    } catch (err: any) {
      logs.push(`❌ Error: ${err.message}`);
    } finally {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    }

    setOutput(logs);
    setRunning(false);
  };

  // ── Code exercise: Submit ──
  const handleSubmit = async () => {
    if (!user || !exercise || submitted) return;
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
      setOutput((prev) => [
        ...prev,
        "",
        "🎉 Great job! Exercise completed!",
        `+${exercise.xp_reward} XP earned!`,
        `Total XP: ${user.xp + exercise.xp_reward}`,
      ]);
    } else {
      setOutput((prev) => [...prev, "❌ Error saving progress. Try again."]);
    }
  };

  // ── Loading state ──
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

  if (!exercise) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🤷</span>
          <h1 className="font-fredoka text-2xl font-bold">Exercise not found</h1>
          <Button className="mt-4 rounded-xl" onClick={() => navigate("/courses")}>
            Back to Courses
          </Button>
        </div>
      </AppLayout>
    );
  }

  // ══════════════════════════════════════════════════════
  // INTERACTIVE EXERCISE LAYOUT (Std 3 tap/drag exercises)
  // ══════════════════════════════════════════════════════
  if (exercise.type === "interactive") {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto animate-slide-up">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-fredoka text-2xl font-bold">{exercise.title}</h1>
                <p className="text-sm text-muted-foreground">{courseName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-banana/40 rounded-2xl px-4 py-2">
              <span className="text-2xl">⭐</span>
              <span className="font-fredoka text-lg font-bold text-foreground">
                +{exercise.xp_reward} XP
              </span>
            </div>
          </div>

          {/* Instruction banner */}
          <div className="bg-pastel-blue rounded-3xl p-5 mb-6 text-center shadow-playful">
            <p className="font-fredoka text-2xl font-bold">
              {exercise.instructions}
            </p>
          </div>

          {/* Already completed banner */}
          {submitted && (
            <div className="bg-green-100 border-2 border-green-300 rounded-3xl p-4 mb-6 text-center">
              <p className="font-fredoka text-xl font-bold text-green-700">
                ✅ You already completed this! +{exercise.xp_reward} XP earned
              </p>
            </div>
          )}

          {/* Interactive area */}
          <div className="bg-card rounded-3xl shadow-playful p-6 min-h-[360px] flex items-center justify-center">
            {submitted ? (
              <div className="text-center space-y-4">
                <p className="text-8xl">🏆</p>
                <p className="font-fredoka text-3xl font-bold text-green-600">
                  Level Complete!
                </p>
                <Button
                  className="rounded-2xl font-bold text-lg px-8 py-6 shadow-playful"
                  onClick={() => navigate(-1)}
                >
                  ← Back to Levels
                </Button>
              </div>
            ) : (
              <InteractiveExerciseRenderer
                interactionConfig={exercise.interaction_config}
                onComplete={handleComplete}
              />
            )}
          </div>

          {/* Hints */}
          {exercise.hints && exercise.hints.length > 0 && (
            <div className="bg-banana/30 rounded-2xl p-4 shadow-sm mt-4">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 w-full text-left font-semibold"
              >
                <Lightbulb className="h-5 w-5" />
                <span>Hints ({exercise.hints.length})</span>
                {showHints
                  ? <ChevronUp className="h-4 w-4 ml-auto" />
                  : <ChevronDown className="h-4 w-4 ml-auto" />
                }
              </button>
              {showHints && (
                <ul className="mt-3 space-y-2">
                  {exercise.hints.map((hint: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // ══════════════════════════════════════════════════════
  // CODE EXERCISE LAYOUT (original editor layout)
  // ══════════════════════════════════════════════════════
  return (
    <AppLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col animate-slide-up">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-fredoka text-xl font-bold">{exercise.title}</h1>
              <p className="text-xs text-muted-foreground">{courseName}</p>
            </div>
          </div>
          <span className="text-sm font-bold text-primary">
            +{exercise.xp_reward} XP
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          {/* Left: Instructions + Hints */}
          <div className="flex flex-col gap-4 overflow-auto">
            <div className="bg-card rounded-2xl p-5 shadow-playful flex-1 overflow-auto">
              <h2 className="font-fredoka text-lg font-bold mb-3">📋 Instructions</h2>
              <div className="prose prose-sm text-foreground whitespace-pre-line">
                {exercise.instructions}
              </div>
            </div>
            {exercise.hints && exercise.hints.length > 0 && (
              <div className="bg-banana/30 rounded-2xl p-4 shadow-sm">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 w-full text-left font-semibold"
                >
                  <Lightbulb className="h-5 w-5 text-foreground" />
                  <span>Hints ({exercise.hints.length})</span>
                  {showHints
                    ? <ChevronUp className="h-4 w-4 ml-auto" />
                    : <ChevronDown className="h-4 w-4 ml-auto" />
                  }
                </button>
                {showHints && (
                  <ul className="mt-3 space-y-2">
                    {exercise.hints.map((hint: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Right: Editor + Console + Buttons */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="bg-card rounded-2xl shadow-playful flex-1 overflow-hidden flex flex-col min-h-0">
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
                    lineNumbers: "on",
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 12 },
                  }}
                />
              </div>
            </div>

            {/* Console */}
            <div className="bg-foreground/5 rounded-2xl shadow-sm h-36 flex flex-col">
              <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-sm font-fredoka font-bold">📟 Console Output</span>
                {output.length > 0 && (
                  <button
                    onClick={() => setOutput([])}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex-1 p-3 overflow-auto font-mono text-sm space-y-1">
                {output.length === 0 ? (
                  <p className="text-muted-foreground italic text-xs">
                    Click "Run" to execute your code...
                  </p>
                ) : (
                  output.map((line, i) => (
                    <p
                      key={i}
                      className={
                        line.startsWith("✅") || line.startsWith("🎉")
                          ? "text-green-600 font-semibold"
                          : line.startsWith("❌")
                          ? "text-red-500 font-semibold"
                          : line.startsWith("⚠️")
                          ? "text-yellow-600"
                          : line === ""
                          ? "my-1"
                          : "text-foreground"
                      }
                    >
                      {line}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11 font-bold border-2"
                onClick={handleRun}
                disabled={running}
              >
                <Play className="h-4 w-4 mr-1" />
                {running ? "Running..." : "Run Code"}
              </Button>
              <Button
                className="flex-1 rounded-xl h-11 font-bold shadow-playful"
                onClick={handleSubmit}
                disabled={submitted}
              >
                <Send className="h-4 w-4 mr-1" />
                {submitted ? "✅ Submitted!" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Exercise;