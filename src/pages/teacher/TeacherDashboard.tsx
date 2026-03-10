import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, Users, ClipboardList, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch classrooms
      const { data: classroomsData } = await supabase
        .from("classrooms")
        .select("*")
        .eq("teacher_id", user.id);

      if (classroomsData) {
        setClassrooms(classroomsData);

        // Fetch total students
        const { count } = await supabase
          .from("classroom_students")
          .select("*", { count: "exact", head: true })
          .in("classroom_id", classroomsData.map((c) => c.id));
        setTotalStudents(count || 0);

        // Fetch assignments
        const { data: assignmentsData } = await supabase
          .from("assignments")
          .select("*")
          .in("classroom_id", classroomsData.map((c) => c.id));
        setAssignments(assignmentsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-fredoka text-3xl font-bold">
              Welcome, {user.name}! 👩‍🏫
            </h1>
            <p className="text-muted-foreground">Here's your classroom overview</p>
          </div>
          <Button
            size="lg"
            className="rounded-2xl font-bold shadow-playful hover:scale-105 transition-transform"
            onClick={() => navigate("/teacher/assignments")}
          >
            <Plus className="h-5 w-5 mr-1" /> Create Assignment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-pastel-blue rounded-2xl p-5 shadow-playful">
            <Users className="h-8 w-8 mb-2 text-foreground" />
            <p className="font-fredoka text-3xl font-bold">{totalStudents}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
          <div className="bg-mint rounded-2xl p-5 shadow-playful">
            <ClipboardList className="h-8 w-8 mb-2 text-foreground" />
            <p className="font-fredoka text-3xl font-bold">{assignments.length}</p>
            <p className="text-sm text-muted-foreground">Assignments</p>
          </div>
          <div className="bg-banana rounded-2xl p-5 shadow-playful">
            <BarChart3 className="h-8 w-8 mb-2 text-foreground" />
            <p className="font-fredoka text-3xl font-bold">{classrooms.length}</p>
            <p className="text-sm text-muted-foreground">Classrooms</p>
          </div>
        </div>

        {/* Classrooms */}
        <div>
          <h2 className="font-fredoka text-xl font-bold mb-4">Your Classrooms</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-muted rounded-2xl p-4 h-20 animate-pulse" />
              ))}
            </div>
          ) : classrooms.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center shadow-playful">
              <p className="text-4xl mb-3">🏫</p>
              <p className="font-fredoka text-lg font-bold">No classrooms yet</p>
              <p className="text-muted-foreground text-sm mb-4">
                Create your first classroom to get started
              </p>
              <Button
                onClick={() => navigate("/teacher/classrooms")}
                className="rounded-xl"
              >
                Create Classroom
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {classrooms.map((classroom) => (
                <button
                  key={classroom.id}
                  onClick={() => navigate(`/teacher/classrooms/${classroom.id}`)}
                  className="w-full bg-card rounded-2xl p-4 shadow-playful hover:shadow-playful-lg hover:scale-[1.01] transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-fredoka text-lg font-bold">
                        {classroom.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Code: {classroom.code}
                      </p>
                    </div>
                    <span className="text-2xl">📚</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div>
          <h2 className="font-fredoka text-xl font-bold mb-4">Recent Submissions</h2>
          <div className="bg-card rounded-2xl shadow-playful p-6 text-center text-muted-foreground">
            No submissions yet
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TeacherDashboard;