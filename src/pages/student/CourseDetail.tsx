// src/pages/student/CourseDetail.tsx

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

// Icon per exercise type
const typeIcon: Record<string, string> = {
  code: "💻",
  visual: "🎮",
  interactive: "👆",
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
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (!courseData) { setLoading(false); return; }

      const { data: modulesData } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      const { data: exercisesData } = await supabase
        .from("exercises")
        .select("*")
        .in("module_id", (modulesData || []).map((m) => m.id))
        .order("order_index");

      const { data: completionsData } = await supabase
        .from("completions")
        .select("exercise_id")
        .eq("student_id", user.id);

      const completedSet = new Set(
        (completionsData || []).map((c) => c.exercise_id)
      );
      setCompletedIds(completedSet);

      const modules = (modulesData || []).map((module) => ({
        ...module,
        exercises: (exercisesData || []).filter((e) => e.module_id === module.id),
      }));

      const totalExercises = modules.reduce((sum, m) => sum + m.exercises.length, 0);
      const completedExercises = modules.reduce(
        (sum, m) => sum + m.exercises.filter((e) => completedSet.has(e.id)).length, 0
      );

      setCourse({ ...courseData, modules, totalExercises, completedExercises });
      setLoading(false);
    };

    fetchCourse();
  }, [courseId, user]);

  // Navigate to correct page based on exercise type
  const handleExerciseClick = (exercise: any) => {
    if (exercise.is_locked) return;
    if (exercise.type === "visual") {
      navigate(`/playground?exercise=${exercise.id}`);
    } else {
      // both "code" and "interactive" go to /exercise/:id
      navigate(`/exercise/${exercise.id}`);
    }
  };

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
                  {course.completedExercises}/{course.totalExercises} completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modules and exercises */}
        <div className="space-y-8">
          {course.modules.map((module: any) => {
            const moduleCompleted = module.exercises.filter((e: any) => completedIds.has(e.id)).length;
            const moduleTotal = module.exercises.length;

            return (
              <div key={module.id}>
                {/* Module header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{module.icon}</span>
                    <div>
                      <h2 className="font-fredoka text-xl font-bold">{module.title}</h2>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {moduleCompleted}/{moduleTotal}
                  </span>
                </div>

                <div className="space-y-3 pl-4 border-l-4 border-primary/20">
                  {module.exercises.map((exercise: any, index: number) => {
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
                        onClick={() => handleExerciseClick(exercise)}
                      >
                        {/* Status icon */}
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                          ) : isLocked ? (
                            <Lock className="h-8 w-8 text-muted-foreground" />
                          ) : (
                            <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center">
                              <Play className="h-4 w-4 text-primary" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{typeIcon[exercise.type] || "📝"}</span>
                            <h3 className="font-semibold">
                              Level {index + 1}: {exercise.title}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {exercise.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                            difficultyColors[exercise.difficulty] || "bg-muted"
                          }`}>
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
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseDetail;