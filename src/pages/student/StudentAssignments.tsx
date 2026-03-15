// src/pages/student/StudentAssignments.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Icon per exercise type
const typeIcon: Record<string, string> = {
  code: "💻",
  visual: "🎮",
  interactive: "👆",
};

const StudentAssignments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAssignments = async () => {
      // Find ALL classrooms the student belongs to
      const { data: memberData } = await supabase
        .from("classroom_students")
        .select("classroom_id")
        .eq("student_id", user.id);

      if (!memberData || memberData.length === 0) {
        setLoading(false);
        return;
      }

      const classroomIds = memberData.map((m) => m.classroom_id);

      // Fetch assignments for all classrooms
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select("*")
        .in("classroom_id", classroomIds)
        .order("due_date");

      if (!assignmentsData || assignmentsData.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch exercises for each assignment
      const assignmentIds = assignmentsData.map((a) => a.id);
      const { data: aeData } = await supabase
        .from("assignment_exercises")
        .select("assignment_id, exercise_id, exercises(*)")
        .in("assignment_id", assignmentIds);

      // Fetch THIS student's completions only
      const { data: completionsData } = await supabase
        .from("completions")
        .select("exercise_id")
        .eq("student_id", user.id);

      const completed = new Set((completionsData || []).map((c) => c.exercise_id));
      setCompletedIds(completed);

      // Combine assignments with their exercises
      const combined = assignmentsData.map((a) => ({
        ...a,
        exercises: (aeData || [])
          .filter((ae) => ae.assignment_id === a.id)
          .map((ae) => ae.exercises),
      }));

      setAssignments(combined);
      setLoading(false);
    };

    fetchAssignments();
  }, [user]);

  // Navigate based on exercise type
  const handleExerciseClick = (ex: any) => {
    if (ex.type === "visual") {
      navigate(`/playground?exercise=${ex.id}`);
    } else {
      // both "code" and "interactive" go to /exercise/:id
      navigate(`/exercise/${ex.id}`);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-muted rounded-2xl h-8 w-48 animate-pulse" />
          <div className="bg-muted rounded-2xl h-40 animate-pulse" />
          <div className="bg-muted rounded-2xl h-40 animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-slide-up">
        <h1 className="font-fredoka text-3xl font-bold mb-2">My Assignments 📋</h1>
        <p className="text-muted-foreground mb-8">Complete your assignments!</p>

        {assignments.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">📋</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">No assignments yet</h2>
            <p className="text-muted-foreground">
              Your teacher hasn't assigned anything yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const validExercises = assignment.exercises.filter((e: any) => e);
              const doneCount = validExercises.filter(
                (e: any) => completedIds.has(e.id)
              ).length;
              const total = validExercises.length;
              const allDone = total > 0 && doneCount === total;
              const progressPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

              return (
                <div key={assignment.id} className="bg-card rounded-2xl p-5 shadow-playful">
                  {/* Assignment header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-fredoka text-lg font-bold">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      allDone
                        ? "bg-green-100 text-green-700"
                        : "bg-banana/50 text-foreground"
                    }`}>
                      {doneCount}/{total} done
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-muted rounded-full h-2 overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all ${
                        allDone ? "bg-green-500" : "bg-primary"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Levels list */}
                  <div className="space-y-2">
                    {validExercises.map((ex: any, index: number) => {
                      const isCompleted = completedIds.has(ex.id);
                      return (
                        <button
                          key={ex.id}
                          onClick={() => handleExerciseClick(ex)}
                          className="w-full flex items-center gap-3 bg-muted rounded-xl p-3 text-left hover:bg-primary/10 transition-all text-sm"
                        >
                          {/* Completion status */}
                          <span className="text-lg flex-shrink-0">
                            {isCompleted ? "✅" : "⬜"}
                          </span>

                          {/* Type icon + Level label */}
                          <span className="text-base flex-shrink-0">
                            {typeIcon[ex.type] || "📝"}
                          </span>

                          <span className={`flex-1 font-medium ${
                            isCompleted ? "line-through text-muted-foreground" : ""
                          }`}>
                            Level {index + 1}: {ex.title}
                          </span>

                          <span className="text-xs text-primary font-semibold flex-shrink-0">
                            +{ex.xp_reward} XP
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* All done celebration */}
                  {allDone && (
                    <div className="mt-4 bg-green-50 rounded-xl p-3 text-center">
                      <p className="font-fredoka text-green-700 font-bold">
                        🎉 Assignment Complete! Great work!
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudentAssignments;