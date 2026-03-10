import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { XPProgressBar } from "@/components/gamification/XPProgressBar";
import { AchievementBadge } from "@/components/gamification/AchievementBadge";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/useCourses";
import { Play } from "lucide-react";

const allAchievements = [
  "first-code", "streak-5", "streak-10", "streak-20",
  "banana-collector", "speed-coder", "level-10", "master-coder", "bug-squasher"
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courses, loading } = useCourses();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-fredoka text-3xl font-bold">
              Hey {user.name}! {user.avatar}
            </h1>
            <p className="text-muted-foreground">Let's keep the coding streak going!</p>
          </div>
          <Button
            size="lg"
            className="rounded-2xl font-bold shadow-playful hover:scale-105 transition-transform"
            onClick={() => navigate("/courses")}
          >
            <Play className="h-5 w-5 mr-1" /> Continue Learning
          </Button>
        </div>

        {/* XP Bar */}
        <div className="grid grid-cols-1 gap-4">
          <XPProgressBar currentXP={user.xp} level={user.level} />
        </div>

        {/* Course progress cards */}
        <div>
          <h2 className="font-fredoka text-xl font-bold mb-4">Your Courses</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted rounded-2xl p-5 h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.slice(0, 3).map((course) => {
                const progress = course.totalExercises > 0
                  ? Math.round((course.completedExercises / course.totalExercises) * 100)
                  : 0;
                return (
                  <button
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className={`bg-${course.color} rounded-2xl p-5 text-left shadow-playful hover:shadow-playful-lg hover:scale-[1.02] transition-all`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{course.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-fredoka text-lg font-bold truncate">{course.title}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{course.difficulty}</p>
                      </div>
                    </div>
                    <div className="bg-card/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs mt-2 font-semibold">
                      {course.completedExercises}/{course.totalExercises} exercises • {progress}%
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div>
          <h2 className="font-fredoka text-xl font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {allAchievements.map((id) => (
              <AchievementBadge
                key={id}
                id={id}
                unlocked={false}
              />
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default StudentDashboard;