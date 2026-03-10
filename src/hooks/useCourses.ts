import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Exercise {
  id: string;
  module_id: string;
  title: string;
  description: string;
  type: "code" | "visual";
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  starter_code: string;
  instructions: string;
  hints: string[];
  order_index: number;
  is_locked: boolean;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
  exercises: Exercise[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  modules: Module[];
  totalExercises: number;
  completedExercises: number;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .order("difficulty");

        if (coursesError) throw coursesError;

        // Fetch modules
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .order("order_index");

        if (modulesError) throw modulesError;

        // Fetch exercises
        const { data: exercisesData, error: exercisesError } = await supabase
          .from("exercises")
          .select("*")
          .order("order_index");

        if (exercisesError) throw exercisesError;

        // Combine data
        const combined = coursesData.map((course) => {
          const courseModules = modulesData
            .filter((m) => m.course_id === course.id)
            .map((module) => ({
              ...module,
              exercises: exercisesData.filter((e) => e.module_id === module.id),
            }));

          const totalExercises = courseModules.reduce(
            (sum, m) => sum + m.exercises.length, 0
          );

          return {
            ...course,
            modules: courseModules,
            totalExercises,
            completedExercises: 0,
          };
        });

        setCourses(combined);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};