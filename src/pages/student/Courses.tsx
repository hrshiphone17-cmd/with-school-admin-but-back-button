import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCourses } from "@/hooks/useCourses";

const Courses = () => {
  const navigate = useNavigate();
  const { courses, loading } = useCourses();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-up">
        <h1 className="font-fredoka text-3xl font-bold mb-2">Coding Courses 📚</h1>
        <p className="text-muted-foreground mb-8">Pick a course and start your adventure!</p>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted rounded-3xl p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = course.totalExercises > 0
                ? Math.round((course.completedExercises / course.totalExercises) * 100)
                : 0;
              return (
                <button
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="bg-card rounded-3xl p-6 text-left shadow-playful hover:shadow-playful-lg hover:scale-[1.02] transition-all border-2 border-transparent hover:border-primary/30 group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl group-hover:animate-wiggle">{course.icon}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-${course.color} capitalize`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <h3 className="font-fredoka text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                  <div className="bg-muted rounded-full h-3 overflow-hidden mb-2">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>{course.modules.length} modules</span>
                    <span>{progress}% complete</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Courses;