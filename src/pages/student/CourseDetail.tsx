import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, Play, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const difficultyColors: Record<string, string> = {
  easy: "bg-mint text-accent-foreground",
  medium: "bg-banana text-foreground",
  hard: "bg-peach text-foreground",
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !user) return;

    const fetchCourse = async () => {
      // Fetch course
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (!courseData) { setLoading(false); return; }

      // Fetch modules
      const { data: modulesData } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      // Fetch exercises
      const { data: exercisesData } = await supabase
        .from("exercises")
        .select("*")
        .in("module_id", (modulesData || []).map((m) => m.id))
        .order("order_index");

      // Fetch completions for this student
      const { data: completionsData } = await supabase
        .from("completions")
        .select("exercise_id")
        .eq("student_id", user.id);

      const completedSet = new Set(
        (completionsData || []).map((c) => c.exercise_id)
      );
      setCompletedIds(completedSet);

      // Combine
      const modules = (modulesData || []).map((module) => ({
        ...module,
        exercises: (exercisesData || []).filter(
          (e) => e.module_id === module.id
        ),
      }));

      const totalExercises = modules.reduce(
        (sum, m) => sum + m.exercises.length, 0
      );
      const completedExercises = modules.reduce(
        (sum, m) => sum + m.exercises.filter((e) => completedSet.has(e.id)).length, 0
      );

      setCourse({ ...courseData, modules, totalExercises, completedExercises });
      setLoading(false);
    };

    fetchCourse();
  }, [courseId, user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-muted rounded-3xl h-40 animate-pulse" />
          <div className="bg-muted rounded-2xl h-20 animate-pulse" />
          <div className="bg-muted rounded-2xl h-20 animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🤷</span>
          <h1 className="font-fredoka text-2xl font-bold">Course not found</h1>
          <Button className="mt-4 rounded-xl" onClick={() => navigate("/courses")}>
            Back to Courses
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-slide-up">
        <Button
          variant="ghost"
          className="rounded-xl mb-4"
          onClick={() => navigate("/courses")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
        </Button>

        {/* Course header */}
        <div className={`bg-${course.color} rounded-3xl p-6 mb-8 shadow-playful`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{course.icon}</span>
            <div>
              <h1 className="font-fredoka text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-1">{course.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-card capitalize">
                  {course.difficulty}
                </span>
                <span className="text-sm font-semibold">
                  {course.completedExercises}/{course.totalExercises} exercises
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modules and exercises */}
        <div className="space-y-8">
          {course.modules.map((module: any) => (
            <div key={module.id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{module.icon}</span>
                <div>
                  <h2 className="font-fredoka text-xl font-bold">{module.title}</h2>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>

              <div className="space-y-3 pl-4 border-l-4 border-primary/20">
                {module.exercises.map((exercise: any) => {
                  const isCompleted = completedIds.has(exercise.id);
                  const isLocked = exercise.is_locked;

                  return (
                    <div
                      key={exercise.id}
                      className={`flex items-center gap-4 bg-card rounded-2xl p-4 shadow-sm transition-all ${
                        isLocked
                          ? "opacity-60"
                          : "hover:shadow-playful cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!isLocked) {
                          navigate(
                            exercise.type === "visual"
                              ? `/playground?exercise=${exercise.id}`
                              : `/exercise/${exercise.id}`
                          );
                        }
                      }}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-8 w-8 text-accent" />
                        ) : isLocked ? (
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center">
                            <Play className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{exercise.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {exercise.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            difficultyColors[exercise.difficulty] || "bg-muted"
                          }`}
                        >
                          {exercise.difficulty}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          +{exercise.xp_reward} XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseDetail;