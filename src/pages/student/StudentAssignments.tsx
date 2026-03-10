import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { mockAssignments } from "@/data/mockClassrooms";
import { mockCourses } from "@/data/mockCourses";

const StudentAssignments = () => {
  const navigate = useNavigate();

  // Get exercises for each assignment
  const assignments = mockAssignments.map((a) => {
    const exercises = a.exerciseIds.map((eid) => {
      for (const course of mockCourses) {
        for (const mod of course.modules) {
          const found = mod.exercises.find((e) => e.id === eid);
          if (found) return found;
        }
      }
      return null;
    }).filter(Boolean);

    return { ...a, exercises };
  });

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-slide-up">
        <h1 className="font-fredoka text-3xl font-bold mb-2">My Assignments 📋</h1>
        <p className="text-muted-foreground mb-8">Complete your coding assignments!</p>

        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-card rounded-2xl p-5 shadow-playful">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-fredoka text-lg font-bold">{assignment.title}</h3>
                  <p className="text-sm text-muted-foreground">Due: {assignment.dueDate}</p>
                </div>
                <span className="bg-banana/50 rounded-lg px-3 py-1 text-xs font-bold">
                  {assignment.exercises.filter((e: any) => e?.isCompleted).length}/{assignment.exercises.length} done
                </span>
              </div>
              <div className="space-y-2">
                {assignment.exercises.map((ex: any) => (
                  <button
                    key={ex.id}
                    onClick={() => navigate(ex.type === "visual" ? `/playground?exercise=${ex.id}` : `/exercise/${ex.id}`)}
                    className="w-full flex items-center gap-3 bg-muted rounded-xl p-3 text-left hover:bg-primary/10 transition-all text-sm"
                  >
                    <span>{ex.isCompleted ? "✅" : "⬜"}</span>
                    <span className="flex-1">{ex.title}</span>
                    <span className="text-xs text-primary font-semibold">+{ex.xpReward} XP</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentAssignments;
