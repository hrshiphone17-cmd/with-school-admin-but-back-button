import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ClassroomDetail = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classroomId) return;

    const fetchData = async () => {
      // Fetch classroom
      const { data: classroomData } = await supabase
        .from("classrooms")
        .select("*")
        .eq("id", classroomId)
        .single();

      if (!classroomData) { setLoading(false); return; }
      setClassroom(classroomData);

      // Fetch students in this classroom
      const { data: studentLinks } = await supabase
        .from("classroom_students")
        .select("student_id")
        .eq("classroom_id", classroomId);

      let studentsData: any[] = [];
      if (studentLinks && studentLinks.length > 0) {
        const studentIds = studentLinks.map((s) => s.student_id);
        const { data } = await supabase
          .from("users")
          .select("*")
          .in("id", studentIds);
        studentsData = data || [];
        setStudents(studentsData);
      }

      // Fetch assignments for this classroom
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select("*, assignment_exercises(exercise_id)")
        .eq("classroom_id", classroomId)
        .order("created_at", { ascending: false });

      if (!assignmentsData) { setLoading(false); return; }

      // For each assignment, calculate real completion stats
      const enriched = await Promise.all(
        assignmentsData.map(async (a) => {
          const exerciseIds = a.assignment_exercises.map((ae: any) => ae.exercise_id);
          let completedStudents = 0;

          if (exerciseIds.length > 0 && studentsData.length > 0) {
            for (const student of studentsData) {
              const { data: completions } = await supabase
                .from("completions")
                .select("exercise_id")
                .eq("student_id", student.id)
                .in("exercise_id", exerciseIds);

              if ((completions || []).length === exerciseIds.length) {
                completedStudents++;
              }
            }
          }

          return {
            ...a,
            completedStudents,
            exerciseCount: exerciseIds.length,
          };
        })
      );

      setAssignments(enriched);
      setLoading(false);
    };

    fetchData();
  }, [classroomId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="bg-muted rounded-3xl h-32 animate-pulse" />
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-muted rounded-2xl h-64 animate-pulse" />
            <div className="bg-muted rounded-2xl h-64 animate-pulse" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!classroom) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🤷</span>
          <h1 className="font-fredoka text-2xl font-bold">Classroom not found</h1>
          <Button className="mt-4 rounded-xl" onClick={() => navigate("/teacher/classrooms")}>
            Back to Classrooms
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto animate-slide-up">
        <Button
          variant="ghost"
          className="rounded-xl mb-4"
          onClick={() => navigate("/teacher/classrooms")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {/* Header */}
        <div className="bg-pastel-blue rounded-3xl p-6 mb-8 shadow-playful">
          <h1 className="font-fredoka text-3xl font-bold">{classroom.name}</h1>
          <p className="text-muted-foreground mt-1">
            Join Code:{" "}
            <span className="font-mono font-bold text-foreground">{classroom.code}</span>
            {" "}• {students.length} students
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Roster */}
          <div>
            <h2 className="font-fredoka text-xl font-bold mb-4">Students 👨‍🎓</h2>
            <div className="bg-card rounded-2xl shadow-playful overflow-hidden">
              {students.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-4xl mb-3">👨‍🎓</p>
                  <p className="font-fredoka font-bold">No students yet</p>
                  <p className="text-sm mt-1">
                    Share code{" "}
                    <span className="font-mono font-bold text-foreground">{classroom.code}</span>
                    {" "}with your students
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-sm text-muted-foreground">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Level</th>
                      <th className="px-4 py-3">XP</th>
                      <th className="px-4 py-3">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{student.avatar}</span>
                            <span className="font-semibold text-sm">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-fredoka font-bold">{student.level}</td>
                        <td className="px-4 py-3 text-sm text-primary font-semibold">{student.xp}</td>
                        <td className="px-4 py-3 text-sm">🔥 {student.streak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Assignments */}
          <div>
            <h2 className="font-fredoka text-xl font-bold mb-4">Assignments 📋</h2>
            <div className="space-y-3">
              {assignments.length === 0 ? (
                <div className="bg-card rounded-2xl p-6 text-center text-muted-foreground shadow-sm">
                  No assignments yet
                </div>
              ) : (
                assignments.map((assignment) => {
                  const progressPercent = students.length > 0
                    ? Math.round((assignment.completedStudents / students.length) * 100)
                    : 0;

                  return (
                    <div key={assignment.id} className="bg-card rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {assignment.exerciseCount} exercise{assignment.exerciseCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <span className="text-xs bg-muted rounded-lg px-2 py-1">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="bg-muted rounded-full h-2 overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full transition-all ${progressPercent === 100 ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {assignment.completedStudents}/{students.length} students completed
                        {progressPercent > 0 && ` (${progressPercent}%)`}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ClassroomDetail;