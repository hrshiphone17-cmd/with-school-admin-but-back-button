import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const Analytics = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teacher's classrooms on load
  useEffect(() => {
    if (!user) return;
    const fetchClassrooms = async () => {
      const { data } = await supabase
        .from("classrooms")
        .select("*")
        .eq("teacher_id", user.id);
      if (data && data.length > 0) {
        setClassrooms(data);
        setSelectedClassId(data[0].id);
      }
      setLoading(false);
    };
    fetchClassrooms();
  }, [user]);

  // Fetch data when classroom selection changes
  useEffect(() => {
    if (!selectedClassId) return;
    const fetchClassData = async () => {
      setLoading(true);

      // Fetch students in classroom
      const { data: studentLinks } = await supabase
        .from("classroom_students")
        .select("student_id")
        .eq("classroom_id", selectedClassId);

      if (studentLinks && studentLinks.length > 0) {
        const studentIds = studentLinks.map((s) => s.student_id);
        const { data: studentsData } = await supabase
          .from("users")
          .select("*")
          .in("id", studentIds);
        setStudents(studentsData || []);

        // Fetch completions for all students in classroom
        const { data: completionsData } = await supabase
          .from("completions")
          .select("*")
          .in("student_id", studentIds);
        setCompletions(completionsData || []);
      } else {
        setStudents([]);
        setCompletions([]);
      }

      // Fetch assignments for classroom
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select("*")
        .eq("classroom_id", selectedClassId);
      setAssignments(assignmentsData || []);

      setLoading(false);
    };
    fetchClassData();
  }, [selectedClassId]);

  // Chart data
  const progressData = students.map((s) => ({
    name: s.name.split(" ")[0],
    xp: s.xp,
    level: s.level,
  }));

  const assignmentData = assignments.map((a) => {
    const completed = completions.filter((c) =>
      c.exercise_id && assignments.some((x) => x.id === a.id)
    ).length;
    return {
      name: a.title.length > 15 ? a.title.slice(0, 15) + "…" : a.title,
      completed,
      total: students.length,
    };
  });

  const totalCompletions = completions.length;
  const completionRate = students.length > 0
    ? Math.round((completions.length / (students.length * 7)) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto animate-slide-up">
        <h1 className="font-fredoka text-3xl font-bold mb-2">Analytics 📊</h1>
        <p className="text-muted-foreground mb-6">Track student progress and engagement</p>

        {/* Classroom tabs */}
        {classrooms.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">📊</span>
            <h2 className="font-fredoka text-2xl font-bold mb-2">No classrooms yet</h2>
            <p className="text-muted-foreground">Create a classroom first to see analytics</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              {classrooms.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(c.id)}
                  className={`px-5 py-2.5 rounded-xl font-fredoka font-semibold text-sm transition-all ${
                    selectedClassId === c.id
                      ? "bg-primary text-primary-foreground shadow-playful"
                      : "bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-pastel-blue rounded-2xl p-4 text-center shadow-playful">
                <p className="font-fredoka text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="bg-mint rounded-2xl p-4 text-center shadow-playful">
                <p className="font-fredoka text-2xl font-bold">{assignments.length}</p>
                <p className="text-xs text-muted-foreground">Assignments</p>
              </div>
              <div className="bg-banana rounded-2xl p-4 text-center shadow-playful">
                <p className="font-fredoka text-2xl font-bold">{totalCompletions}</p>
                <p className="text-xs text-muted-foreground">Completions</p>
              </div>
              <div className="bg-peach rounded-2xl p-4 text-center shadow-playful">
                <p className="font-fredoka text-2xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student XP chart */}
              <div className="bg-card rounded-2xl p-5 shadow-playful">
                <h3 className="font-fredoka text-lg font-bold mb-4">Student XP Progress</h3>
                {progressData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No students in this classroom yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="xp" fill="hsl(270, 40%, 72%)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Assignment completion chart */}
              <div className="bg-card rounded-2xl p-5 shadow-playful">
                <h3 className="font-fredoka text-lg font-bold mb-4">Assignment Completion</h3>
                {assignmentData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    No assignments created yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={assignmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#B5EAD7" radius={[8, 8, 0, 0]} name="Completed" />
                      <Bar dataKey="total" fill="#A8D8EA" radius={[8, 8, 0, 0]} name="Total Students" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Student overview table */}
              <div className="bg-card rounded-2xl p-5 shadow-playful lg:col-span-2">
                <h3 className="font-fredoka text-lg font-bold mb-4">Student Overview</h3>
                {students.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No students in this classroom yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-2 px-3">Student</th>
                          <th className="text-center py-2 px-3">Level</th>
                          <th className="text-center py-2 px-3">XP</th>
                          <th className="text-center py-2 px-3">Streak</th>
                          <th className="text-center py-2 px-3">Exercises Done</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => {
                          const studentCompletions = completions.filter(
                            (c) => c.student_id === student.id
                          ).length;
                          return (
                            <tr
                              key={student.id}
                              className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                            >
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{student.avatar}</span>
                                  <span className="font-semibold">{student.name}</span>
                                </div>
                              </td>
                              <td className="text-center py-3 px-3">
                                <span className="bg-primary/15 text-primary font-bold px-2 py-0.5 rounded-full text-xs">
                                  Lv.{student.level}
                                </span>
                              </td>
                              <td className="text-center py-3 px-3 font-semibold">
                                {student.xp.toLocaleString()}
                              </td>
                              <td className="text-center py-3 px-3">
                                🔥 {student.streak}
                              </td>
                              <td className="text-center py-3 px-3">
                                {studentCompletions}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Analytics;